import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import { WorkspaceStore } from '../workspace/workspace.store';
import { Tag } from './tag';
import { TagService } from './tag.service';

type TagState = {
    tags: Map<string, Tag[]>; // string is workspaceId
    loading: boolean;
    updating: boolean;
    creating: boolean;
    error: string | null;
}

const initialTagState: TagState = {
    tags: new Map(),
    loading: false,
    creating: false,
    updating: false,
    error: null
};

export const TagStore = signalStore(
    { providedIn: "root" },
    withState(initialTagState),
    withMethods((store, tagService = inject(TagService), workspaceStore = inject(WorkspaceStore)) => ({
        getTagsByWorkspaceId(workspaceId: string) : Observable<Tag[]> {
            patchState(store, { loading: true });
            if (store.tags().has(workspaceId)) {
                patchState(store, { loading: false });
                return of(store.tags().get(workspaceId)!);
            }
            if (workspaceStore.workspacesDetails().has(workspaceId)) {
                const tags = workspaceStore.workspacesDetails().get(workspaceId)!.tags;
                const updatedtags = new Map(store.tags());
                updatedtags.set(workspaceId, tags);
                patchState(store, {
                    tags: updatedtags,
                    loading: false,
                    error: null
                });
                return of(tags);
            }
            return tagService.getTagsByWorkspaceId(workspaceId).pipe(
                tap({
                    next: (tags) => {
                        patchState(store, {
                            tags: store.tags().set(workspaceId, tags),
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
                        patchState(store, {
                            tags: store.tags().set(workspaceId, store.tags().has(workspaceId) 
                                ? [newtag, ...store.tags().get(workspaceId)!]
                                : [newtag]),
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
            workspaceId: string,
            id: string, 
            name: string,
            color: string,
            icon: string,
            description?: string,
        ) {
            patchState(store, { updating: true })
            return tagService.updateTag(id, name, color, icon, description).pipe(
                tap({
                    next: (updatedtag) => {
                        patchState(store, {
                            tags: store.tags().set(workspaceId, store.tags().has(workspaceId) 
                                ? store.tags().get(workspaceId)!.map(tag => tag.id === updatedtag.id ? updatedtag : tag)
                                : [updatedtag]),
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