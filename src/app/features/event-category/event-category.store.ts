import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import { WorkspaceStore } from '../workspace/workspace.store';
import { EventCategory } from './event-category';
import { EventCategoryService } from './event-category.service';

type EventCategoryState = {
    eventCategories: Map<string, EventCategory[]>; // string is workspaceId
    loading: boolean;
    updating: boolean;
    creating: boolean;
    error: string | null;
}

const initialeventCategoryState: EventCategoryState = {
    eventCategories: new Map(),
    loading: false,
    creating: false,
    updating: false,
    error: null
};

export const EventCategoryStore = signalStore(
    { providedIn: "root" },
    withState(initialeventCategoryState),
    withMethods((store, eventCategoryService = inject(EventCategoryService), workspaceStore = inject(WorkspaceStore)) => ({
        getEventCategoriesByWorkspaceId(workspaceId: string) : Observable<EventCategory[]> {
            patchState(store, { loading: true });
            if (store.eventCategories().has(workspaceId)) {
                patchState(store, { loading: false });
                return of(store.eventCategories().get(workspaceId)!);
            }
            return eventCategoryService.getEventCategoryByWorkspaceId(workspaceId).pipe(
                tap({
                    next: (eventCategories) => {
                        patchState(store, {
                            eventCategories: store.eventCategories().set(workspaceId, eventCategories),
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
        createEventCategory(
            workspaceId: string, 
            name: string,
            color: string,
            icon: string,
            description?: string,
        ) {
            patchState(store, { creating: true });
            return eventCategoryService.createEventCategory(workspaceId, name, color, icon, description).pipe(
                tap({
                    next: (neweventCategory) => {
                        patchState(store, {
                            eventCategories: store.eventCategories().set(workspaceId, store.eventCategories().has(workspaceId) 
                                ? [neweventCategory, ...store.eventCategories().get(workspaceId)!]
                                : [neweventCategory]),
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
        updateEventCategory(
            workspaceId: string,
            id: string, 
            name: string,
            color: string,
            icon: string,
            description?: string,
        ) {
            patchState(store, { updating: true })
            return eventCategoryService.updateEventCategory(id, name, color, icon, description).pipe(
                tap({
                    next: (updatedeventCategory) => {
                        patchState(store, {
                            eventCategories: store.eventCategories().set(workspaceId, store.eventCategories().has(workspaceId) 
                                ? store.eventCategories().get(workspaceId)!.map(eventCategory => eventCategory.id === updatedeventCategory.id ? updatedeventCategory : eventCategory)
                                : [updatedeventCategory]),
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