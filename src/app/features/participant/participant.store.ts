import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import { WorkspaceStore } from '../workspace/workspace.store';
import { Participant } from './participant';
import { ParticipantService } from './participant.service';

type ParticipantState = {
    participants: Map<string, Participant[]>; // string is workspaceId
    loading: boolean;
    updating: boolean;
    creating: boolean;
    error: string | null;
}

const initialParticipantState: ParticipantState = {
    participants: new Map(),
    loading: false,
    creating: false,
    updating: false,
    error: null
};

export const ParticipantStore = signalStore(
    { providedIn: "root" },
    withState(initialParticipantState),
    withMethods((store, participantService = inject(ParticipantService), workspaceStore = inject(WorkspaceStore)) => ({
        getParticipantsByWorkspaceId(workspaceId: string) : Observable<Participant[]> {
            patchState(store, { loading: true });
            if (store.participants().has(workspaceId)) {
                patchState(store, { loading: false });
                return of(store.participants().get(workspaceId)!);
            }
            if (workspaceStore.workspacesDetails().has(workspaceId)) {
                const participants = workspaceStore.workspacesDetails().get(workspaceId)!.participants;
                patchState(store, {
                    participants: store.participants().set(workspaceId, participants),
                    loading: false,
                    error: null
                });
                return of(participants);
            }
            return participantService.getParticipantByWorkspaceId(workspaceId).pipe(
                tap({
                    next: (participants) => {
                        patchState(store, {
                            participants: store.participants().set(workspaceId, participants),
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
        createParticipant(
            workspaceId: string, 
            firstName: string,
            lastName: string,
            participantCategoryId: string,
            email?: string,
            phoneNumber?: string,
            address?: string,
            city?: string,
            country?: string,
            description?: string,
            dateOfBirth?: Date
        ) {
            patchState(store, { creating: true });
            return participantService.createParticipant(
                workspaceId,
                firstName,
                lastName,
                participantCategoryId,
                email,
                phoneNumber,
                address,
                city,
                country,
                description,
                dateOfBirth
            ).pipe(
                tap({
                    next: (newParticipant) => {
                        patchState(store, {
                            participants: store.participants().set(workspaceId, store.participants().has(workspaceId) 
                                ? [newParticipant, ...store.participants().get(workspaceId)!]
                                : [newParticipant]),
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
        updateParticipant(
            workspaceId: string, 
            id: string, 
            firstName: string,
            lastName: string,
            participantCategoryId: string,
            email?: string,
            phoneNumber?: string,
            address?: string,
            city?: string,
            country?: string,
            description?: string,
            dateOfBirth?: Date
        ) {
            patchState(store, { updating: true })
            return participantService.updateParticipant(
                id,
                firstName,
                lastName,
                participantCategoryId,
                email,
                phoneNumber,
                address,
                city,
                country,
                description,
                dateOfBirth
            ).pipe(
                tap({
                    next: (updatedParticipant) => {
                        patchState(store, {
                            participants: store.participants().set(workspaceId, store.participants().has(workspaceId) 
                                ? store.participants().get(workspaceId)!.map(Participant => Participant.id === updatedParticipant.id ? updatedParticipant : Participant)
                                : [updatedParticipant]),
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