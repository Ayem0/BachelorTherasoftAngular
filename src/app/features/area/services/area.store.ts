import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import {
  addModelToParentMap,
  updateModelMap,
  updateParentMap,
} from '../../../shared/utils/store.utils';
import { Area, AreaRequest } from '../models/area';
import { AreaService } from './area.service';

type AreaState = {
  areas: Map<string, Area>; // string is area id
  areaIdsByLocationId: Map<string, string[]>;
  loading: boolean;
  updating: boolean;
  creating: boolean;
  error: string | null;
};

const initialAreaState: AreaState = {
  areas: new Map(),
  areaIdsByLocationId: new Map(),
  loading: false,
  creating: false,
  updating: false,
  error: null,
};

export const AreaStore = signalStore(
  { providedIn: 'root' },
  withState(initialAreaState),
  withMethods((store, areaService = inject(AreaService)) => ({
    getAreasByLocationId(locationId: string): Observable<Area[]> {
      patchState(store, { loading: true });
      if (store.areaIdsByLocationId().has(locationId)) {
        const ids = store.areaIdsByLocationId().get(locationId)!;
        patchState(store, { loading: false });
        return of(ids.map((id) => store.areas().get(id)!));
      }

      return areaService.getAreasByLocationId(locationId).pipe(
        tap({
          next: (areas) => {
            const updatedAreaIdsByLocationId = updateParentMap(
              store.areaIdsByLocationId(),
              locationId,
              areas
            );
            const updatedAreas = updateModelMap(store.areas(), areas);
            patchState(store, {
              areas: updatedAreas,
              areaIdsByLocationId: updatedAreaIdsByLocationId,
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

    getAreaById(id: string): Observable<Area> {
      patchState(store, { loading: true });
      if (store.areas().has(id)) {
        patchState(store, { loading: false });
        return of(store.areas().get(id)!);
      }
      return areaService.getById(id).pipe(
        tap({
          next: (area) => {
            const updatedAreas = updateModelMap(store.areas(), [area]);
            patchState(store, {
              areas: updatedAreas,
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

    createArea(locationId: string, req: AreaRequest) {
      patchState(store, { creating: true });
      return areaService.createArea(locationId, req).pipe(
        tap({
          next: (newArea) => {
            const updatedAreas = updateModelMap(store.areas(), [newArea]);
            const updatedAreaIdsByLocationId = addModelToParentMap(
              store.areaIdsByLocationId(),
              locationId,
              newArea
            );
            patchState(store, {
              areas: updatedAreas,
              areaIdsByLocationId: updatedAreaIdsByLocationId,
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
    updateArea(id: string, req: AreaRequest) {
      patchState(store, { updating: true });
      return areaService.updateArea(id, req).pipe(
        tap({
          next: (updatedArea) => {
            const updatedAreas = updateModelMap(store.areas(), [updatedArea]);
            patchState(store, {
              areas: updatedAreas,
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
