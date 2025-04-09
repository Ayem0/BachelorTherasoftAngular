import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import {
  addModelToParentMap,
  updateModelMap,
  updateParentMap,
} from '../../../shared/utils/store.utils';
import { Participant, ParticipantRequest } from '../models/participant';
import { ParticipantService } from './participant.service';

type ParticipantState = {
  participants: Map<string, Participant>; // string is workspaceId
  participantIdsByWorkspaceId: Map<string, string[]>;
  loading: boolean;
  updating: boolean;
  creating: boolean;
  error: string | null;
};

const initialParticipantState: ParticipantState = {
  participants: new Map(),
  participantIdsByWorkspaceId: new Map(),
  loading: false,
  creating: false,
  updating: false,
  error: null,
};

export const ParticipantStore = signalStore(
  { providedIn: 'root' },
  withState(initialParticipantState),
  withMethods((store, participantService = inject(ParticipantService)) => ({
    getParticipantsByWorkspaceId(
      workspaceId: string
    ): Observable<Participant[]> {
      patchState(store, { loading: true });
      if (store.participantIdsByWorkspaceId().has(workspaceId)) {
        const ids = store.participantIdsByWorkspaceId().get(workspaceId)!;
        patchState(store, { loading: false });
        return of(ids.map((x) => store.participants().get(x)!));
      }
      return participantService.getParticipantByWorkspaceId(workspaceId).pipe(
        tap({
          next: (participants) => {
            const updatedParticipants = updateModelMap(
              store.participants(),
              participants
            );
            const updatedParticipantIdsByWorkspaceId = updateParentMap(
              store.participantIdsByWorkspaceId(),
              workspaceId,
              participants
            );
            patchState(store, {
              participants: updatedParticipants,
              participantIdsByWorkspaceId: updatedParticipantIdsByWorkspaceId,
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
    createParticipant(workspaceId: string, req: ParticipantRequest) {
      patchState(store, { creating: true });
      return participantService.createParticipant(workspaceId, req).pipe(
        tap({
          next: (newParticipant) => {
            const updatedParticipants = updateModelMap(store.participants(), [
              newParticipant,
            ]);
            const updatedparticipantIdsByWorkspaceId = addModelToParentMap(
              store.participantIdsByWorkspaceId(),
              workspaceId,
              newParticipant
            );
            patchState(store, {
              participants: updatedParticipants,
              participantIdsByWorkspaceId: updatedparticipantIdsByWorkspaceId,
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
    updateParticipant(id: string, req: ParticipantRequest) {
      patchState(store, { updating: true });
      return participantService.updateParticipant(id, req).pipe(
        tap({
          next: (updatedParticipant) => {
            const updatedParticipants = updateModelMap(store.participants(), [
              updatedParticipant,
            ]);
            patchState(store, {
              participants: updatedParticipants,
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
