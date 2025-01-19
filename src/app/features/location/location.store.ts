import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import { Place } from './location';
import { LocationService } from './location.service';

type LocationState = {
    locations: Map<string, Place>;
    locationIdsByWorkspaceId: Map<string, string[]>;
    loading: boolean;
    updating: boolean;
    creating: boolean;
    error: string | null;
}

const initialLocationState: LocationState = {
    locations: new Map(),
    locationIdsByWorkspaceId: new Map(),
    loading: false,
    creating: false,
    updating: false,
    error: null
};

export const LocationStore = signalStore(
    { providedIn: "root" },
    withState(initialLocationState),
    withMethods((store, locationService = inject(LocationService)) => ({
        getLocationsByWorkspaceId(workspaceId: string) : Observable<Place[]> {
            patchState(store, { loading: true });
            if (store.locationIdsByWorkspaceId().has(workspaceId)) {
                const ids = store.locationIdsByWorkspaceId().get(workspaceId)!;
                const locations = ids.map(id => store.locations().get(id)!);
                patchState(store, { loading: false });
                return of(locations);
            }
            return locationService.getLocationsByWorkspaceId(workspaceId).pipe(
                tap({
                    next: (locations) => {
                        const updatedLocationIdsByWorkspaceId = new Map(store.locationIdsByWorkspaceId());
                        updatedLocationIdsByWorkspaceId.set(workspaceId, locations.map(location => location.id));
                        const updatedLocations = new Map(store.locations());
                        locations.forEach(location => updatedLocations.set(location.id, location));
                        patchState(store, {
                            locationIdsByWorkspaceId: updatedLocationIdsByWorkspaceId,
                            locations: updatedLocations,
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

        getLocationById(id: string): Observable<Place> {
            patchState(store, { loading: true });
            if (store.locations().has(id)) {
                patchState(store, { loading: false });
                return of(store.locations().get(id)!);
            }
            return locationService.getById(id).pipe(
                tap({
                    next: (location) => {
                        const updatedLocations = new Map(store.locations());
                        updatedLocations.set(location.id, location);
                        patchState(store, {
                            locations: updatedLocations,
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
            return locationService.createLocation(workspaceId, name, description, address, city, country).pipe(
                tap({
                    next: (newlocation) => {
                        const updatedLocations = new Map(store.locations());
                        updatedLocations.set(newlocation.id, newlocation);
                        let updatedLocationIdsByWorkspaceId : Map<string, string[]> | null = null;
                        if (store.locationIdsByWorkspaceId().has(workspaceId)) {
                            updatedLocationIdsByWorkspaceId = new Map(store.locationIdsByWorkspaceId());
                            updatedLocationIdsByWorkspaceId.set(workspaceId, [...store.locationIdsByWorkspaceId().get(workspaceId)!, newlocation.id]);
                        }
                        patchState(store, {
                            locations: updatedLocations,
                            locationIdsByWorkspaceId: updatedLocationIdsByWorkspaceId ?? store.locationIdsByWorkspaceId(),
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

        updateLocation(id: string, name: string, description?: string) {
            patchState(store, { updating: true })
            return locationService.updateLocation(id, name, description).pipe(
                tap({
                    next: (updatedLocation) => {
                        const updatedLocations = new Map(store.locations());
                        updatedLocations.set(updatedLocation.id, updatedLocation);
                        patchState(store, {
                            locations: updatedLocations,
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