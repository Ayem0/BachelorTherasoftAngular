import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import {
  addModelToParentMap,
  updateModelMap,
  updateParentMap,
} from '../../../shared/utils/store.utils';
import {
  ParticipantCategory,
  ParticipantCategoryRequest,
} from '../models/participant-category';
import { ParticipantCategoryService } from './participant-category.service';

type ParticipantCategoryState = {
  participantCategories: Map<string, ParticipantCategory>; // string is id
  participantCategoryIdsByWorkspaceId: Map<string, string[]>;
  loading: boolean;
  updating: boolean;
  creating: boolean;
  error: string | null;
};

const initialParticipantCategoryState: ParticipantCategoryState = {
  participantCategories: new Map(),
  participantCategoryIdsByWorkspaceId: new Map(),
  loading: false,
  creating: false,
  updating: false,
  error: null,
};

export const ParticipantCategoryStore = signalStore(
  { providedIn: 'root' },
  withState(initialParticipantCategoryState),
  withMethods(
    (
      store,
      participantCategoryService = inject(ParticipantCategoryService)
    ) => ({
      getParticipantCategoriesByWorkspaceId(
        workspaceId: string
      ): Observable<ParticipantCategory[]> {
        patchState(store, { loading: true });

        if (store.participantCategoryIdsByWorkspaceId().has(workspaceId)) {
          const ids = store
            .participantCategoryIdsByWorkspaceId()
            .get(workspaceId)!;
          const participantCategories = ids.map(
            (x) => store.participantCategories().get(x)!
          );
          patchState(store, { loading: false });
          return of(participantCategories);
        }
        return participantCategoryService
          .getParticipantCategoryByWorkspaceId(workspaceId)
          .pipe(
            tap({
              next: (participantCategories) => {
                const updatedParticipantCategoryIdsByWorkspaceId =
                  updateParentMap(
                    store.participantCategoryIdsByWorkspaceId(),
                    workspaceId,
                    participantCategories
                  );
                const updatedParticipantCategories = updateModelMap(
                  store.participantCategories(),
                  participantCategories
                );
                patchState(store, {
                  participantCategories: updatedParticipantCategories,
                  participantCategoryIdsByWorkspaceId:
                    updatedParticipantCategoryIdsByWorkspaceId,
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
      createParticipantCategory(
        workspaceId: string,
        req: ParticipantCategoryRequest
      ) {
        patchState(store, { creating: true });
        return participantCategoryService
          .createParticipantCategory(workspaceId, req)
          .pipe(
            tap({
              next: (newParticipantCategory) => {
                const updatedParticipantCategories = updateModelMap(
                  store.participantCategories(),
                  [newParticipantCategory]
                );
                const updatedParticipantCategoryIdsByWorkspaceId =
                  addModelToParentMap(
                    store.participantCategoryIdsByWorkspaceId(),
                    workspaceId,
                    newParticipantCategory
                  );
                patchState(store, {
                  participantCategories: updatedParticipantCategories,
                  participantCategoryIdsByWorkspaceId:
                    updatedParticipantCategoryIdsByWorkspaceId,
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
      updateParticipantCategory(id: string, req: ParticipantCategoryRequest) {
        patchState(store, { updating: true });
        return participantCategoryService
          .updateParticipantCategory(id, req)
          .pipe(
            tap({
              next: (updatedParticipantCategory) => {
                const updatedParticipantCategories = updateModelMap(
                  store.participantCategories(),
                  [updatedParticipantCategory]
                );
                patchState(store, {
                  participantCategories: updatedParticipantCategories,
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
    })
  )
);
