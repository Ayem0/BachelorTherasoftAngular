import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import { WorkspaceStore } from '../workspace/workspace.store';
import { Participant } from './participant';
import { ParticipantService } from './participant.service';

type ParticipantState = {
    participants: Map<string, Participant>; // string is workspaceId
    participantIdsByWorkspaceId: Map<string, string[]>,
    loading: boolean;
    updating: boolean;
    creating: boolean;
    error: string | null;
}

const initialParticipantState: ParticipantState = {
    participants: new Map(),
    participantIdsByWorkspaceId: new Map(),
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
            if (store.participantIdsByWorkspaceId().has(workspaceId)) {
                const ids = store.participantIdsByWorkspaceId().get(workspaceId)!;
                patchState(store, { loading: false });
                return of(ids.map(x => store.participants().get(x)!));
            }
            return participantService.getParticipantByWorkspaceId(workspaceId).pipe(
                tap({
                    next: (participants) => {
                        const updatedParticipantIdsByWorkspaceId = new Map(store.participantIdsByWorkspaceId());
                        updatedParticipantIdsByWorkspaceId.set(workspaceId, participants.map(wr => wr.id));
                        const updatedParticipants = new Map(store.participants());
                        participants.forEach(x => updatedParticipants.set(x.id, x));
                        patchState(store, {
                            participants: updatedParticipants,
                            participantIdsByWorkspaceId: updatedParticipantIdsByWorkspaceId,
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
                        const updatedParticiants = new Map(store.participants());
                        updatedParticiants.set(newParticipant.id, newParticipant);
                        let updatedparticipantIdsByWorkspaceId : Map<string, string[]> | null = null;
                        if (store.participantIdsByWorkspaceId().has(workspaceId)) {
                            updatedparticipantIdsByWorkspaceId = new Map(store.participantIdsByWorkspaceId());
                            updatedparticipantIdsByWorkspaceId.set(workspaceId, [...store.participantIdsByWorkspaceId().get(workspaceId)!, newParticipant.id]);
                        } 
                        patchState(store, {
                            participants: updatedParticiants,
                            participantIdsByWorkspaceId: updatedparticipantIdsByWorkspaceId ?? store.participantIdsByWorkspaceId(),
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
                        const updatedParticipants = new Map(store.participants());
                        updatedParticipants.set(updatedParticipant.id, updatedParticipant);

                        patchState(store, {
                            participants: updatedParticipants,
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