import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import { LocationStore } from '../location/location.store';
import { Area } from './area';
import { AreaService } from './area.service';

type AreaState = {
    areas: Map<string, Area>; // string is area id
    areaIdsByLocationId: Map<string, string[]>,
    loading: boolean;
    updating: boolean;
    creating: boolean;
    error: string | null;
}

const initialAreaState: AreaState = {
    areas: new Map(),
    areaIdsByLocationId: new Map(),
    loading: false,
    creating: false,
    updating: false,
    error: null
};

export const AreaStore = signalStore(
    { providedIn: "root" },
    withState(initialAreaState),
    withMethods((store, areaService = inject(AreaService), locationStore = inject(LocationStore)) => ({
        getAreasByLocationId(locationId: string) : Observable<Area[]> {
            patchState(store, { loading: true });
            if (store.areaIdsByLocationId().has(locationId)) {
                const ids = store.areaIdsByLocationId().get(locationId)!;
                patchState(store, { loading: false });
                return of(ids.map(id => store.areas().get(id)!));
            }
            
            return areaService.getAreasByLocationId(locationId).pipe(
                tap({
                    next: (areas) => {
                        const updatedAreaIdsByLocationId = new Map(store.areaIdsByLocationId());
                        updatedAreaIdsByLocationId.set(locationId, areas.map(area => area.id));
                        const updatedAreas = new Map(store.areas());
                        areas.forEach(area => updatedAreas.set(area.id, area));
                        patchState(store, {
                            areas: updatedAreas,
                            areaIdsByLocationId: updatedAreaIdsByLocationId,
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

        getAreaById(id: string): Observable<Area> {
            patchState(store, { loading: true });
            if (store.areas().has(id)) {
                patchState(store, { loading: false });
                return of(store.areas().get(id)!);
            }
            return areaService.getById(id).pipe(
                tap({
                    next: (area) => {
                        const updatedAreas = new Map(store.areas());
                        updatedAreas.set(area.id, area);
                        patchState(store, {
                            areas: updatedAreas,
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
                        const updatedAreas = new Map(store.areas());
                        updatedAreas.set(newArea.id, newArea);
                        let updatedAreaIdsByLocationId : Map<string, string[]> | null = null;
                        if (store.areaIdsByLocationId().has(locationId)) {
                            updatedAreaIdsByLocationId = new Map(store.areaIdsByLocationId());
                            updatedAreaIdsByLocationId.set(locationId, [...store.areaIdsByLocationId().get(locationId)!, newArea.id]);
                        }
                        patchState(store, {
                            areas: updatedAreas,
                            areaIdsByLocationId: updatedAreaIdsByLocationId ?? store.areaIdsByLocationId(),
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
        updateArea(id: string, name: string, description?: string) {
            patchState(store, { updating: true })
            return areaService.updateArea(id, name, description).pipe(
                tap({
                    next: (updatedArea) => {
                        const updatedAreas = new Map(store.areas());
                        updatedAreas.set(updatedArea.id, updatedArea);
                        patchState(store, {
                            areas: updatedAreas,
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