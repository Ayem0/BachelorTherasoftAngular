import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import {
  addModelToParentMap,
  updateModelMap,
  updateParentMap,
} from '../../shared/utils/store.utils';
import { EventCategory, EventCategoryRequest } from './event-category';
import { EventCategoryService } from './event-category.service';

type EventCategoryState = {
  eventCategories: Map<string, EventCategory>; // string is id
  eventCategoryIdsByWorkspaceId: Map<string, string[]>;
  loading: boolean;
  updating: boolean;
  creating: boolean;
  error: string | null;
};

const initialeventCategoryState: EventCategoryState = {
  eventCategories: new Map(),
  eventCategoryIdsByWorkspaceId: new Map(),
  loading: false,
  creating: false,
  updating: false,
  error: null,
};

export const EventCategoryStore = signalStore(
  { providedIn: 'root' },
  withState(initialeventCategoryState),
  withMethods((store, eventCategoryService = inject(EventCategoryService)) => ({
    getEventCategoriesByWorkspaceId(
      workspaceId: string
    ): Observable<EventCategory[]> {
      patchState(store, { loading: true });
      if (store.eventCategoryIdsByWorkspaceId().has(workspaceId)) {
        const ids = store.eventCategoryIdsByWorkspaceId().get(workspaceId)!;
        patchState(store, { loading: false });
        return of(ids.map((x) => store.eventCategories().get(x)!));
      }
      return eventCategoryService
        .getEventCategoryByWorkspaceId(workspaceId)
        .pipe(
          tap({
            next: (eventCategories) => {
              const updatedEventCategories = updateModelMap(
                store.eventCategories(),
                eventCategories
              );
              const updatedEventCategoryIdsByWorkspaceId = updateParentMap(
                store.eventCategoryIdsByWorkspaceId(),
                workspaceId,
                eventCategories
              );

              patchState(store, {
                eventCategories: updatedEventCategories,
                eventCategoryIdsByWorkspaceId:
                  updatedEventCategoryIdsByWorkspaceId ??
                  store.eventCategoryIdsByWorkspaceId(),
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

    createEventCategory(workspaceId: string, req: EventCategoryRequest) {
      patchState(store, { creating: true });
      return eventCategoryService.createEventCategory(workspaceId, req).pipe(
        tap({
          next: (newEventCategory) => {
            const updatedEventCategories = updateModelMap(
              store.eventCategories(),
              [newEventCategory]
            );
            const updatedEventCategoryIdsByWorkspaceId = addModelToParentMap(
              store.eventCategoryIdsByWorkspaceId(),
              workspaceId,
              newEventCategory
            );
            patchState(store, {
              eventCategories: updatedEventCategories,
              eventCategoryIdsByWorkspaceId:
                updatedEventCategoryIdsByWorkspaceId,
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

    updateEventCategory(id: string, req: EventCategoryRequest) {
      patchState(store, { updating: true });
      return eventCategoryService.updateEventCategory(id, req).pipe(
        tap({
          next: (updatedEventCategory) => {
            const updatedEventCategories = updateModelMap(
              store.eventCategories(),
              [updatedEventCategory]
            );
            patchState(store, {
              eventCategories: updatedEventCategories,
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
