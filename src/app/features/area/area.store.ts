import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import { LocationStore } from '../location/location.store';
import { Area } from './area';
import { AreaService } from './area.service';

type AreaState = {
    areas: Map<string, Area[]>; // string is locationId
    loading: boolean;
    updating: boolean;
    creating: boolean;
    error: string | null;
}

const initialAreaState: AreaState = {
    areas: new Map(),
    loading: false,
    creating: false,
    updating: false,
    error: null
};

export const AreaStore = signalStore(
    { providedIn: "root" },
    withState(initialAreaState),
    withMethods((store, areaService = inject(AreaService), locationStore = inject(LocationStore)) => ({
        getAreasByLocationId(workspaceId: string, locationId: string) : Observable<Area[]> {
            patchState(store, { loading: true });
            if (store.areas().has(locationId)) {
                patchState(store, { loading: false });
                return of(store.areas().get(locationId)!);
            }
            if (locationStore.locationsDetails().has(locationId)) {
                const areas = locationStore.locationsDetails().get(locationId)!.areas;
                patchState(store, {
                    areas: store.areas().set(locationId, areas),
                    loading: false,
                    error: null
                });
                return of(areas);
            }
            return areaService.getAreasByLocationId(workspaceId, locationId).pipe(
                tap({
                    next: (areas) => {
                        patchState(store, {
                            areas: store.areas().set(locationId, areas),
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
        createArea(
            locationId: string, 
            name: string, 
            description?: string
        ) {
            patchState(store, { creating: true });
            return areaService.createArea(
                locationId,
                name, 
                description
            ).pipe(
                tap({
                    next: (newArea) => {
                        patchState(store, {
                            areas: store.areas().set(locationId, store.areas().has(locationId) 
                                ? [newArea, ...store.areas().get(locationId)!]
                                : [newArea]),
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
        updateArea(locationId: string, id: string, name: string, description?: string) {
            patchState(store, { updating: true })
            return areaService.updateArea(id, name, description).pipe(
                tap({
                    next: (updatedArea) => {
                        patchState(store, {
                            areas: store.areas().set(locationId, store.areas().has(locationId) 
                                ? store.areas().get(locationId)!.map(area => area.id === updatedArea.id ? updatedArea : area)
                                : [updatedArea]),
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