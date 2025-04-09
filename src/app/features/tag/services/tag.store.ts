import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Id } from '../../../shared/models/entity';
import { StoreTag } from '../models/tag';

type TagState = {
  tags: Map<Id, StoreTag>;
  loadedWorkspaceIds: Set<Id>;
};

const initialTagState: TagState = {
  tags: new Map(),
  loadedWorkspaceIds: new Set(),
};

export const TagStore = signalStore(
  { providedIn: 'root' },
  withState(initialTagState),
  withComputed((store) => ({
    tagsArr: computed(() => Array.from(store.tags().values())),
  })),
  withMethods((store) => ({
    setTag(tag: StoreTag) {
      patchState(store, {
        tags: new Map([...store.tags(), [tag.id, tag]]),
      });
    },
    setTags(tags: StoreTag[]) {
      const newTags = new Map(store.tags());
      tags.forEach((tag) => newTags.set(tag.id, tag));
      patchState(store, {
        tags: newTags,
      });
    },
    deleteTag(tagId: Id) {
      const newTags = new Map(store.tags());
      newTags.delete(tagId);
      patchState(store, {
        tags: newTags,
      });
    },
    setLoadedWorkspaceId(workspaceId: Id) {
      patchState(store, {
        loadedWorkspaceIds: new Set([
          ...store.loadedWorkspaceIds(),
          workspaceId,
        ]),
      });
    },
  }))
);
