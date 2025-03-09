import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { filter, pipe, switchMap, tap } from 'rxjs';
import { EventCategory, EventCategoryRequest } from './event-category';
import { EventCategoryService } from './event-category.service';

type EventCategoryState = {
  eventCategories: EventCategory[];
  loadedWorkspaceIds: Set<string>;
  selectedWorkspaceId: string;
  isLoading: boolean;
  isUpdating: boolean;
  isCreating: boolean;
  error: string | null;
};

const initialeventCategoryState: EventCategoryState = {
  eventCategories: [],
  loadedWorkspaceIds: new Set(),
  selectedWorkspaceId: '',
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
};

export const EventCategoryStore = signalStore(
  { providedIn: 'root' },
  withState(initialeventCategoryState),
  withComputed((store) => ({
    eventCategoriesBySelectedWorkspace: computed(() =>
      store
        .eventCategories()
        .filter(
          (eventCategory) =>
            eventCategory.workspaceId === store.selectedWorkspaceId()
        )
    ),
  })),
  withMethods((store, eventCategoryService = inject(EventCategoryService)) => ({
    setSelectedWorkspaceId(workspaceId: string): void {
      patchState(store, { selectedWorkspaceId: workspaceId });
    },
    getEventCategoriesByWorkspaceId: rxMethod<void>(
      pipe(
        filter(
          () => !store.loadedWorkspaceIds().has(store.selectedWorkspaceId())
        ),
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          eventCategoryService
            .getEventCategoryByWorkspaceId(store.selectedWorkspaceId())
            .pipe(
              tap({
                next: (eventCategories) => {
                  patchState(store, {
                    eventCategories: [
                      ...store.eventCategories(),
                      ...eventCategories,
                    ],
                    loadedWorkspaceIds: new Set(store.loadedWorkspaceIds()).add(
                      store.selectedWorkspaceId()
                    ),
                    isLoading: false,
                    error: null,
                  });
                },
                error: (error: Error) => {
                  patchState(store, {
                    isLoading: false,
                    error: error.message,
                  });
                },
              })
            )
        )
      )
    ),

    createEventCategory(workspaceId: string, req: EventCategoryRequest) {
      patchState(store, { isCreating: true });
      return eventCategoryService.createEventCategory(workspaceId, req).pipe(
        tap({
          next: (newEventCategory) => {
            patchState(store, {
              eventCategories: [...store.eventCategories(), newEventCategory],
              isCreating: false,
              error: null,
            });
          },
          error: (error: Error) => {
            patchState(store, { isCreating: false, error: error.message });
          },
        })
      );
    },

    updateEventCategory(id: string, req: EventCategoryRequest) {
      patchState(store, { isUpdating: true });
      return eventCategoryService.updateEventCategory(id, req).pipe(
        tap({
          next: (updatedEventCategory) => {
            patchState(store, {
              eventCategories: store
                .eventCategories()
                .map((eventCategory) =>
                  eventCategory.id === updatedEventCategory.id
                    ? updatedEventCategory
                    : eventCategory
                ),
              isUpdating: false,
              error: null,
            });
          },
          error: (error: Error) => {
            patchState(store, { isUpdating: false, error: error.message });
          },
        })
      );
    },
  }))
);
