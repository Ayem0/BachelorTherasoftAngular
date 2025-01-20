import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import { WorkspaceStore } from '../workspace/workspace.store';
import { EventCategory } from './event-category';
import { EventCategoryService } from './event-category.service';

type EventCategoryState = {
    eventCategories: Map<string, EventCategory>; // string is id
    eventCategoryIdsByWorkspaceId: Map<string, string[]>,
    loading: boolean;
    updating: boolean;
    creating: boolean;
    error: string | null;
}

const initialeventCategoryState: EventCategoryState = {
    eventCategories: new Map(),
    eventCategoryIdsByWorkspaceId: new Map(),
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
            if (store.eventCategoryIdsByWorkspaceId().has(workspaceId)) {
                const ids = store.eventCategoryIdsByWorkspaceId().get(workspaceId)!;
                patchState(store, { loading: false });
                return of(ids.map(x => store.eventCategories().get(x)!));
            }
            return eventCategoryService.getEventCategoryByWorkspaceId(workspaceId).pipe(
                tap({
                    next: (eventCategories) => {
                        const updatedEventCategoryIdsByWorkspaceId = new Map(store.eventCategoryIdsByWorkspaceId());
                        updatedEventCategoryIdsByWorkspaceId.set(workspaceId, eventCategories.map(wr => wr.id));
                        const updatedEventCategories = new Map(store.eventCategories());
                        eventCategories.forEach(x => updatedEventCategories.set(x.id, x));

                        patchState(store, {
                            eventCategories: updatedEventCategories,
                            eventCategoryIdsByWorkspaceId: updatedEventCategoryIdsByWorkspaceId ?? store.eventCategoryIdsByWorkspaceId(),
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
                    next: (newEventCategory) => {
                        const updatedEventCategories = new Map(store.eventCategories());
                        updatedEventCategories.set(newEventCategory.id, newEventCategory);
                        let updatedEventCategoryIdsByWorkspaceId : Map<string, string[]> | null = null;
                        if (store.eventCategoryIdsByWorkspaceId().has(workspaceId)) {
                            updatedEventCategoryIdsByWorkspaceId = new Map(store.eventCategoryIdsByWorkspaceId());
                            updatedEventCategoryIdsByWorkspaceId.set(workspaceId, [...store.eventCategoryIdsByWorkspaceId().get(workspaceId)!, newEventCategory.id]);
                        } 
                        patchState(store, {
                            eventCategories: updatedEventCategories,
                            eventCategoryIdsByWorkspaceId: updatedEventCategoryIdsByWorkspaceId ?? store.eventCategoryIdsByWorkspaceId(),
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
            id: string, 
            name: string,
            color: string,
            icon: string,
            description?: string,
        ) {
            patchState(store, { updating: true })
            return eventCategoryService.updateEventCategory(id, name, color, icon, description).pipe(
                tap({
                    next: (updatedEventCategory) => {
                        const updatedEventCategories = new Map(store.eventCategories());
                        updatedEventCategories.set(updatedEventCategory.id, updatedEventCategory);
                        patchState(store, {
                            eventCategories: updatedEventCategories,
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