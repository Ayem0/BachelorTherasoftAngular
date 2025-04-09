import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Id } from '../../../shared/models/entity';
import { StoreEventCategory } from '../models/event-category';

type EventCategoryState = {
  eventCategories: Map<Id, StoreEventCategory>;
  loadedWorkspaceIds: Set<Id>;
};

const initialeventCategoryState: EventCategoryState = {
  eventCategories: new Map(),
  loadedWorkspaceIds: new Set(),
};

export const EventCategoryStore3 = signalStore(
  { providedIn: 'root' },
  withState(initialeventCategoryState),
  withComputed((store) => ({
    eventCategoriesArr: computed(() =>
      Array.from(store.eventCategories().values())
    ),
  })),
  withMethods((store) => ({
    setEventCategory(eventCategory: StoreEventCategory) {
      patchState(store, {
        eventCategories: new Map(store.eventCategories()).set(
          eventCategory.id,
          eventCategory
        ),
      });
    },
    setEventCategories(eventCategories: StoreEventCategory[]) {
      const newEventCategories = new Map(store.eventCategories());
      eventCategories.forEach((eventCategory) => {
        newEventCategories.set(eventCategory.id, eventCategory);
      });
      patchState(store, {
        eventCategories: newEventCategories,
      });
    },
    deleteEventCategory(eventCategoryId: Id) {
      const newEventCategories = new Map(store.eventCategories());
      newEventCategories.delete(eventCategoryId);
      patchState(store, {
        eventCategories: newEventCategories,
      });
    },
    setLoadedWorkspaceId(workspaceId: Id) {
      patchState(store, {
        loadedWorkspaceIds: new Set(store.loadedWorkspaceIds()).add(
          workspaceId
        ),
      });
    },
  }))
);
