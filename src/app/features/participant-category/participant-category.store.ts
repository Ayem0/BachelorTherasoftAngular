import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import { WorkspaceStore } from '../workspace/workspace.store';
import { ParticipantCategory } from './participant-category';
import { ParticipantCategoryService } from './participant-category.service';

type ParticipantCategoryState = {
    participantCategories: Map<string, ParticipantCategory>; // string is id
    participantCategoryIdsByWorkspaceId: Map<string, string[]>,
    loading: boolean;
    updating: boolean;
    creating: boolean;
    error: string | null;
}

const initialParticipantCategoryState: ParticipantCategoryState = {
    participantCategories: new Map(),
    participantCategoryIdsByWorkspaceId: new Map(),
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
            
            if (store.participantCategoryIdsByWorkspaceId().has(workspaceId)) {
                const ids = store.participantCategoryIdsByWorkspaceId().get(workspaceId)!;
                const participantCategories = ids.map(x => store.participantCategories().get(x)!)
                patchState(store, { loading: false });
                return of(participantCategories);
            }
            return participantCategoryService.getParticipantCategoryByWorkspaceId(workspaceId).pipe(
                tap({
                    next: (participantCategories) => {
                        const updatedParticipantCategoryIdsByWorkspaceId = new Map(store.participantCategoryIdsByWorkspaceId());
                        updatedParticipantCategoryIdsByWorkspaceId.set(workspaceId, participantCategories.map(wr => wr.id));
                        const updatedParticipantCategories = new Map(store.participantCategories());
                        participantCategories.forEach(x => updatedParticipantCategories.set(x.id, x));

                        patchState(store, {
                            participantCategories: updatedParticipantCategories,
                            participantCategoryIdsByWorkspaceId: updatedParticipantCategoryIdsByWorkspaceId,
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
                        const updatedParticipantCategories = new Map(store.participantCategories());
                        updatedParticipantCategories.set(newParticipantCategory.id, newParticipantCategory);
                        let updatedParticipantCategoryIdsByWorkspaceId : Map<string, string[]> | null = null;
                        if (store.participantCategoryIdsByWorkspaceId().has(workspaceId)) {
                            updatedParticipantCategoryIdsByWorkspaceId = new Map(store.participantCategoryIdsByWorkspaceId());
                            updatedParticipantCategoryIdsByWorkspaceId.set(workspaceId, [...store.participantCategoryIdsByWorkspaceId().get(workspaceId)!, newParticipantCategory.id]);
                        } 

                        patchState(store, {
                            participantCategories: updatedParticipantCategories,
                            participantCategoryIdsByWorkspaceId: updatedParticipantCategoryIdsByWorkspaceId ?? store.participantCategoryIdsByWorkspaceId(),
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
                        const updatedParticipantCategories = new Map(store.participantCategories());
                        updatedParticipantCategories.set(updatedParticipantCategory.id, updatedParticipantCategory);
                        patchState(store, {
                            participantCategories: updatedParticipantCategories,
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