import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import {
  addModelToParentMap,
  updateModelMap,
  updateParentMap,
} from '../../shared/utils/store.utils';
import { Room, RoomRequest } from './room';
import { RoomService } from './room.service';

type RoomState = {
  rooms: Map<string, Room>;
  roomIdsByAreaId: Map<string, string[]>;
  roomIdsByWorkspaceId: Map<string, string[]>;
  loading: boolean;
  updating: boolean;
  creating: boolean;
  error: string | null;
};

const initialRoomState: RoomState = {
  rooms: new Map(),
  roomIdsByAreaId: new Map(),
  roomIdsByWorkspaceId: new Map(),
  loading: false,
  creating: false,
  updating: false,
  error: null,
};

export const RoomStore = signalStore(
  { providedIn: 'root' },
  withState(initialRoomState),
  withMethods((store, roomService = inject(RoomService)) => ({
    getRoomsByAreaId(areaId: string): Observable<Room[]> {
      patchState(store, { loading: true });
      if (store.roomIdsByAreaId().has(areaId)) {
        const ids = store.roomIdsByAreaId().get(areaId)!;
        const rooms = ids.map((id) => store.rooms().get(id)!);
        patchState(store, { loading: false });
        return of(rooms);
      }
      return roomService.getRoomsByAreaId(areaId).pipe(
        tap({
          next: (rooms) => {
            const updatedRoomIdsByAreaId = new Map(store.roomIdsByAreaId());
            updatedRoomIdsByAreaId.set(
              areaId,
              rooms.map((room) => room.id)
            );
            const updatedRooms = new Map(store.rooms());
            rooms.forEach((room) => updatedRooms.set(room.id, room));
            patchState(store, {
              roomIdsByAreaId: updatedRoomIdsByAreaId,
              rooms: updatedRooms,
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

    getRoomsByWorkspaceId(workspaceId: string): Observable<Room[]> {
      patchState(store, { loading: true });
      if (store.roomIdsByWorkspaceId().has(workspaceId)) {
        const ids = store.roomIdsByWorkspaceId().get(workspaceId)!;
        const rooms = ids.map((id) => store.rooms().get(id)!);
        patchState(store, { loading: false });
        return of(rooms);
      }
      return roomService.getRoomsByWorkspaceId(workspaceId).pipe(
        tap({
          next: (rooms) => {
            const updatedRoomIdsByWorkspaceId = updateParentMap(
              store.roomIdsByWorkspaceId(),
              workspaceId,
              rooms
            );
            const updatedRooms = updateModelMap(store.rooms(), rooms);
            patchState(store, {
              roomIdsByWorkspaceId: updatedRoomIdsByWorkspaceId,
              rooms: updatedRooms,
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

    getRoomById(id: string): Observable<Room> {
      patchState(store, { loading: true });
      if (store.rooms().has(id)) {
        patchState(store, { loading: false });
        return of(store.rooms().get(id)!);
      }
      return roomService.getById(id).pipe(
        tap({
          next: (room) => {
            const updatedRooms = updateModelMap(store.rooms(), [room]);
            patchState(store, {
              rooms: updatedRooms,
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

    createRoom(areaId: string, roomRequest: RoomRequest) {
      patchState(store, { creating: true });
      return roomService.createRoom(areaId, roomRequest).pipe(
        tap({
          next: (newRoom) => {
            const updatedRooms = updateModelMap(store.rooms(), [newRoom]);
            const updatedRoomIdsByAreaId = addModelToParentMap(
              store.roomIdsByWorkspaceId(),
              areaId,
              newRoom
            );
            patchState(store, {
              rooms: updatedRooms,
              roomIdsByAreaId: updatedRoomIdsByAreaId,
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

    updateRoom(id: string, roomRequest: RoomRequest) {
      patchState(store, { updating: true });
      return roomService.updateRoom(id, roomRequest).pipe(
        tap({
          next: (updatedRoom) => {
            const updatedRooms = updateModelMap(store.rooms(), [updatedRoom]);
            patchState(store, {
              rooms: updatedRooms,
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
