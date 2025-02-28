import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import {
  addModelToParentMap,
  updateModelMap,
  updateParentMap,
} from '../../shared/utils/store.utils';
import { Tag, TagRequest } from './tag';
import { TagService } from './tag.service';

type TagState = {
  tags: Map<string, Tag>; // string is id
  tagIdsByWorkspaceId: Map<string, string[]>; // string is worksace, string[] is tagIds
  loading: boolean;
  updating: boolean;
  creating: boolean;
  error: string | null;
};

const initialTagState: TagState = {
  tagIdsByWorkspaceId: new Map(),
  tags: new Map(),
  loading: false,
  creating: false,
  updating: false,
  error: null,
};

export const TagStore = signalStore(
  { providedIn: 'root' },
  withState(initialTagState),
  withMethods((store, tagService = inject(TagService)) => ({
    getTagsByWorkspaceId(workspaceId: string): Observable<Tag[]> {
      patchState(store, { loading: true });
      if (store.tagIdsByWorkspaceId().has(workspaceId)) {
        const ids = store.tagIdsByWorkspaceId().get(workspaceId)!;
        patchState(store, { loading: false });
        return of(ids.map((x) => store.tags().get(x)!));
      }
      return tagService.getTagsByWorkspaceId(workspaceId).pipe(
        tap({
          next: (tags) => {
            const updatedTagIdsByWorkspaceId = updateParentMap(
              store.tagIdsByWorkspaceId(),
              workspaceId,
              tags
            );
            const updatedTags = updateModelMap(store.tags(), tags);
            patchState(store, {
              tags: updatedTags,
              tagIdsByWorkspaceId: updatedTagIdsByWorkspaceId,
              loading: false,
              error: null,
            });
          },
          error: (error: Error) => {
            patchState(store, {
              loading: false,
              error: error.message,
            });
          },
        })
      );
    },
    createTag(workspaceId: string, tagRequest: TagRequest) {
      patchState(store, { creating: true });
      return tagService.createTag(workspaceId, tagRequest).pipe(
        tap({
          next: (newtag) => {
            const updatedTags = updateModelMap(store.tags(), [newtag]);
            const updatedTagIdsByWorkspaceId = addModelToParentMap(
              store.tagIdsByWorkspaceId(),
              workspaceId,
              newtag
            );
            patchState(store, {
              tags: updatedTags,
              tagIdsByWorkspaceId: updatedTagIdsByWorkspaceId,
              creating: false,
              error: null,
            });
          },
          error: (error: Error) => {
            patchState(store, { creating: false, error: error.message });
          },
        })
      );
    },
    updateTag(id: string, tagRequest: TagRequest) {
      patchState(store, { updating: true });
      return tagService.updateTag(id, tagRequest).pipe(
        tap({
          next: (updatedTag) => {
            const updatedTags = updateModelMap(store.tags(), [updatedTag]);
            patchState(store, {
              tags: updatedTags,
              updating: false,
              error: null,
            });
          },
          error: (error: Error) => {
            patchState(store, { updating: false, error: error.message });
          },
        })
      );
    },
  }))
);
