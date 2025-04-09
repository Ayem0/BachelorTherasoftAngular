import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import {
  addModelToParentMap,
  updateModelMap,
  updateParentMap,
} from '../../shared/utils/store.utils';
import { Location, LocationRequest } from './location';
import { LocationService } from './services/location.service';

type LocationState = {
  locations: Map<string, Location>;
  locationIdsByWorkspaceId: Map<string, string[]>;
  loading: boolean;
  updating: boolean;
  creating: boolean;
  error: string | null;
};

const initialLocationState: LocationState = {
  locations: new Map(),
  locationIdsByWorkspaceId: new Map(),
  loading: false,
  creating: false,
  updating: false,
  error: null,
};

export const LocationStore = signalStore(
  { providedIn: 'root' },
  withState(initialLocationState),
  withMethods((store, locationService = inject(LocationService)) => ({
    getLocationsByWorkspaceId(workspaceId: string): Observable<Location[]> {
      patchState(store, { loading: true });
      if (store.locationIdsByWorkspaceId().has(workspaceId)) {
        const ids = store.locationIdsByWorkspaceId().get(workspaceId)!;
        const locations = ids.map((id) => store.locations().get(id)!);
        patchState(store, { loading: false });
        return of(locations);
      }
      return locationService.getLocationsByWorkspaceId(workspaceId).pipe(
        tap({
          next: (locations) => {
            const updatedLocationIdsByWorkspaceId = updateParentMap(
              store.locationIdsByWorkspaceId(),
              workspaceId,
              locations
            );
            const updatedLocations = updateModelMap(
              store.locations(),
              locations
            );
            patchState(store, {
              locationIdsByWorkspaceId: updatedLocationIdsByWorkspaceId,
              locations: updatedLocations,
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

    getLocationById(id: string): Observable<Location> {
      patchState(store, { loading: true });
      if (store.locations().has(id)) {
        patchState(store, { loading: false });
        return of(store.locations().get(id)!);
      }
      return locationService.getById(id).pipe(
        tap({
          next: (location) => {
            const updatedLocations = updateModelMap(store.locations(), [
              location,
            ]);
            patchState(store, {
              locations: updatedLocations,
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

    createLocation(workspaceId: string, req: LocationRequest) {
      patchState(store, { creating: true });
      return locationService.createLocation(workspaceId, req).pipe(
        tap({
          next: (newlocation) => {
            const updatedLocations = updateModelMap(store.locations(), [
              newlocation,
            ]);
            const updatedLocationIdsByWorkspaceId = addModelToParentMap(
              store.locationIdsByWorkspaceId(),
              workspaceId,
              newlocation
            );
            patchState(store, {
              locations: updatedLocations,
              locationIdsByWorkspaceId: updatedLocationIdsByWorkspaceId,
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

    updateLocation(id: string, req: LocationRequest) {
      patchState(store, { updating: true });
      return locationService.updateLocation(id, req).pipe(
        tap({
          next: (updatedLocation) => {
            const updatedLocations = updateModelMap(store.locations(), [
              updatedLocation,
            ]);
            patchState(store, {
              locations: updatedLocations,
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
