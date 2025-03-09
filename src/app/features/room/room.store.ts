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
import { Room, RoomRequest } from './room';
import { RoomService } from './room.service';

type RoomState = {
  rooms: Room[];
  selectedAreaId: string;
  selectedWorkspaceId: string;
  selectedRoomId: string;
  loadedAreaIds: Set<string>;
  loadedWorkspaceIds: Set<string>;
  isLoading: boolean;
  isUpdating: boolean;
  isCreating: boolean;
  error: string | null;
};

const initialRoomState: RoomState = {
  rooms: [],
  selectedAreaId: '',
  selectedRoomId: '',
  selectedWorkspaceId: '',
  loadedAreaIds: new Set(),
  loadedWorkspaceIds: new Set(),
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
};

export const RoomStore = signalStore(
  { providedIn: 'root' },
  withState(initialRoomState),
  withComputed((store) => ({
    roomsBySelectedAreaId: computed(() =>
      store.rooms().filter((room) => room.areaId === store.selectedAreaId())
    ),
    roomsBySelectedWorkspaceId: computed(() =>
      store
        .rooms()
        .filter((room) => room.workspaceId === store.selectedWorkspaceId())
    ),
  })),
  withMethods((store, roomService = inject(RoomService)) => ({
    setSelectedAreaId(areaId: string): void {
      patchState(store, { selectedAreaId: areaId });
    },

    setSelectedWorkspaceId(workspaceId: string): void {
      patchState(store, { selectedWorkspaceId: workspaceId });
    },

    setSelectedRoomId(roomId: string): void {
      patchState(store, { selectedRoomId: roomId });
    },

    getRoomsByAreaId: rxMethod<void>(
      pipe(
        filter(() => !store.loadedAreaIds().has(store.selectedAreaId())),
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          roomService.getRoomsByAreaId(store.selectedAreaId()).pipe(
            tap({
              next: (rooms) => {
                patchState(store, {
                  rooms: [...store.rooms(), ...rooms],
                  loadedAreaIds: new Set(store.loadedAreaIds()).add(
                    store.selectedAreaId()
                  ),
                  isLoading: false,
                });
              },
              error: (err) => {
                console.error(err);
                // TODO handle error
                patchState(store, {
                  isLoading: false,
                });
              },
            })
          )
        )
      )
    ),

    getRoomsByWorkspaceId: rxMethod<void>(
      pipe(
        filter(
          () => !store.loadedWorkspaceIds().has(store.selectedWorkspaceId())
        ),
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          roomService.getRoomsByWorkspaceId(store.selectedWorkspaceId()).pipe(
            tap({
              next: (rooms) => {
                patchState(store, {
                  rooms: [...store.rooms(), ...rooms],
                  loadedWorkspaceIds: new Set(store.loadedWorkspaceIds()).add(
                    store.selectedWorkspaceId()
                  ),
                  isLoading: false,
                });
              },
              error: (err) => {
                console.error(err);
                // TODO handle error
                patchState(store, {
                  isLoading: false,
                });
              },
            })
          )
        )
      )
    ),

    getRoomById: rxMethod<void>(
      pipe(
        filter(
          () =>
            !store.rooms().find((room) => room.id === store.selectedRoomId())
        ),
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          roomService.getById(store.selectedRoomId()).pipe(
            tap({
              next: (room) => {
                patchState(store, {
                  rooms: [...store.rooms(), room],
                  isLoading: false,
                });
              },
              error: (err) => {
                console.error(err);
                // TODO handle error
                patchState(store, {
                  isLoading: false,
                });
              },
            })
          )
        )
      )
    ),

    createRoom(areaId: string, roomRequest: RoomRequest) {
      patchState(store, { isCreating: true });
      return roomService.createRoom(areaId, roomRequest).pipe(
        tap({
          next: (newRoom) => {
            patchState(store, {
              rooms: [...store.rooms(), newRoom],
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

    updateRoom(id: string, roomRequest: RoomRequest) {
      patchState(store, { isUpdating: true });
      return roomService.updateRoom(id, roomRequest).pipe(
        tap({
          next: (updatedRoom) => {
            patchState(store, {
              rooms: store
                .rooms()
                .map((room) => (room.id === id ? updatedRoom : room)),
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
