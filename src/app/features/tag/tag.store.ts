import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import { Tag } from './tag';
import { TagService } from './tag.service';

type TagState = {
    tags: Map<string, Tag>; // string is workspaceId
    tagIdsByWorkspaceId: Map<string, string[]>;
    loading: boolean;
    updating: boolean;
    creating: boolean;
    error: string | null;
}

const initialTagState: TagState = {
    tagIdsByWorkspaceId: new Map(),
    tags: new Map(),
    loading: false,
    creating: false,
    updating: false,
    error: null
};

export const TagStore = signalStore(
    { providedIn: "root" },
    withState(initialTagState),
    withMethods((store, tagService = inject(TagService)) => ({

        getTagsByWorkspaceId(workspaceId: string) : Observable<Tag[]> {
            patchState(store, { loading: true });
            if (store.tagIdsByWorkspaceId().has(workspaceId)) {
                const ids = store.tagIdsByWorkspaceId().get(workspaceId)!;
                patchState(store, { loading: false });
                return of(ids.map(x => store.tags().get(x)!));
            }
            return tagService.getTagsByWorkspaceId(workspaceId).pipe(
                tap({
                    next: (tags) => {
                        const updatedTagIdsByWorkspaceId = new Map(store.tagIdsByWorkspaceId());
                        updatedTagIdsByWorkspaceId.set(workspaceId, tags.map(wr => wr.id));
                        const updatedTags = new Map(store.tags());
                        tags.forEach(x => updatedTags.set(x.id, x));
                        patchState(store, {
                            tags: updatedTags,
                            tagIdsByWorkspaceId: updatedTagIdsByWorkspaceId,
                            loading: false,
                            error: null
                        });
                    },
                    error: (error: Error) => {
                        patchState(store, {
                            loading: false,
                            error: error.message
                        });
                    }
                })
            );
        },
        createTag(
            workspaceId: string, 
            name: string,
            color: string,
            icon: string,
            description?: string,
        ) {
            patchState(store, { creating: true });
            return tagService.createTag(workspaceId, name, color, icon, description).pipe(
                tap({
                    next: (newtag) => {
                        const updatedTags = new Map(store.tags());
                        updatedTags.set(newtag.id, newtag);
                        let updatedTagIdsByWorkspaceId : Map<string, string[]> | null = null;
                        if (store.tagIdsByWorkspaceId().has(workspaceId)) {
                            updatedTagIdsByWorkspaceId = new Map(store.tagIdsByWorkspaceId());
                            updatedTagIdsByWorkspaceId.set(workspaceId, [...store.tagIdsByWorkspaceId().get(workspaceId)!, newtag.id]);
                        } 
                        patchState(store, {
                            tags: updatedTags,
                            tagIdsByWorkspaceId: updatedTagIdsByWorkspaceId ?? store.tagIdsByWorkspaceId(),
                            creating: false,
                            error: null
                        });
                    },
                    error: (error: Error) => {
                        patchState(store, { creating: false, error: error.message });
                    }
                })
            )
        },
        updateTag(
            id: string, 
            name: string,
            color: string,
            icon: string,
            description?: string,
        ) {
            patchState(store, { updating: true })
            return tagService.updateTag(id, name, color, icon, description).pipe(
                tap({
                    next: (updatedTag) => {
                        const updatedTags = new Map(store.tags());
                        updatedTags.set(updatedTag.id, updatedTag);
                        patchState(store, {
                            tags: updatedTags,
                            updating: false,
                            error: null
                        });
                    },
                    error: (error: Error) => {
                        patchState(store, { updating: false, error: error.message });
                    }
                })
            );
        }
    })
))