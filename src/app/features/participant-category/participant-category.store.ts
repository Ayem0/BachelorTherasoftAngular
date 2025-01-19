import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import { ParticipantCategoryService } from './participant-category.service';
import { WorkspaceStore } from '../workspace/workspace.store';
import { ParticipantCategory } from './participant-category';

type ParticipantCategoryState = {
    participantCategories: Map<string, ParticipantCategory[]>; // string is workspaceId
    loading: boolean;
    updating: boolean;
    creating: boolean;
    error: string | null;
}

const initialParticipantCategoryState: ParticipantCategoryState = {
    participantCategories: new Map(),
    loading: false,
    creating: false,
    updating: false,
    error: null
};

export const ParticipantCategoryStore = signalStore(
    { providedIn: "root" },
    withState(initialParticipantCategoryState),
    withMethods((store, participantCategoryService = inject(ParticipantCategoryService), workspaceStore = inject(WorkspaceStore)) => ({
        getParticipantCategoriesByWorkspaceId(workspaceId: string) : Observable<ParticipantCategory[]> {
            patchState(store, { loading: true });
            if (store.participantCategories().has(workspaceId)) {
                patchState(store, { loading: false });
                return of(store.participantCategories().get(workspaceId)!);
            }
            return participantCategoryService.getParticipantCategoryByWorkspaceId(workspaceId).pipe(
                tap({
                    next: (participantCategories) => {
                        patchState(store, {
                            participantCategories: store.participantCategories().set(workspaceId, participantCategories),
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
        createParticipantCategory(
            workspaceId: string, 
            name: string,
            color: string,
            icon: string,
            description?: string,
        ) {
            patchState(store, { creating: true });
            return participantCategoryService.createParticipantCategory(workspaceId, name, color, icon, description).pipe(
                tap({
                    next: (newParticipantCategory) => {
                        patchState(store, {
                            participantCategories: store.participantCategories().set(workspaceId, store.participantCategories().has(workspaceId) 
                                ? [newParticipantCategory, ...store.participantCategories().get(workspaceId)!]
                                : [newParticipantCategory]),
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
        updateParticipantCategory(
            workspaceId: string,
            id: string, 
            name: string,
            color: string,
            icon: string,
            description?: string,
        ) {
            patchState(store, { updating: true })
            return participantCategoryService.updateParticipantCategory(id, name, color, icon, description).pipe(
                tap({
                    next: (updatedParticipantCategory) => {
                        patchState(store, {
                            participantCategories: store.participantCategories().set(workspaceId, store.participantCategories().has(workspaceId) 
                                ? store.participantCategories().get(workspaceId)!.map(ParticipantCategory => ParticipantCategory.id === updatedParticipantCategory.id ? updatedParticipantCategory : ParticipantCategory)
                                : [updatedParticipantCategory]),
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