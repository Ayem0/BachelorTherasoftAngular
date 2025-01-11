import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import { LocationService } from './location.service';
import { WorkspaceStore } from '../workspace/workspace.store';
import { Place } from './location';

type locationState = {
    locations: Map<string, Place[]>; // string is workspaceId
    loading: boolean;
    updating: boolean;
    creating: boolean;
    error: string | null;
}

const initialLocationState: locationState = {
    locations: new Map(),
    loading: false,
    creating: false,
    updating: false,
    error: null
};

export const locationStore = signalStore(
    { providedIn: "root" },
    withState(initialLocationState),
    withMethods((store, locationService = inject(LocationService), workspaceStore = inject(WorkspaceStore)) => ({
        getLocationsByWorkspaceId(workspaceId: string) : Observable<Place[]> {
            patchState(store, { loading: true });
            if (store.locations().has(workspaceId)) {
                patchState(store, { loading: false });
                return of(store.locations().get(workspaceId)!);
            }
            if (workspaceStore.workspacesDetails().has(workspaceId)) {
                const locations = workspaceStore.workspacesDetails().get(workspaceId)!.locations;
                patchState(store, {
                    locations: store.locations().set(workspaceId, locations),
                    loading: false,
                    error: null
                });
                return of(locations);
            }
            return locationService.getLocationByWorkspaceId(workspaceId).pipe(
                tap({
                    next: (locations) => {
                        patchState(store, {
                            locations: store.locations().set(workspaceId, locations),
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
        createLocation(
            workspaceId: string, 
            name: string, 
            description?: string,
            address?: string,
            city?: string,
            country?: string
        ) {
            patchState(store, { creating: true });
            return locationService.createLocation(
                workspaceId,
                name, 
                description,
                address,
                city,
                country

            ).pipe(
                tap({
                    next: (newlocation) => {
                        patchState(store, {
                            locations: store.locations().set(workspaceId, store.locations().has(workspaceId) 
                                ? [newlocation, ...store.locations().get(workspaceId)!]
                                : [newlocation]),
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
        updateLocation(workspaceId: string, id: string, name: string, description?: string) {
            patchState(store, { updating: true })
            return locationService.updateLocation(id, name, description).pipe(
                tap({
                    next: (updatedlocation) => {
                        patchState(store, {
                            locations: store.locations().set(workspaceId, store.locations().has(workspaceId) 
                                ? store.locations().get(workspaceId)!.map(location => location.id === updatedlocation.id ? updatedlocation : location)
                                : [updatedlocation]),
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