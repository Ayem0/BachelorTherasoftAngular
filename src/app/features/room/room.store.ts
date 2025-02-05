import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
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
            const updatedRoomIdsByWorkspaceId = new Map(
              store.roomIdsByWorkspaceId()
            );
            updatedRoomIdsByWorkspaceId.set(
              workspaceId,
              rooms.map((room) => room.id)
            );
            const updatedRooms = new Map(store.rooms());
            rooms.forEach((room) => updatedRooms.set(room.id, room));
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
            const updatedRooms = new Map(store.rooms());
            updatedRooms.set(room.id, room);
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

    createRoom(AreaId: string, roomRequest: RoomRequest) {
      patchState(store, { creating: true });
      return roomService.createRoom(AreaId, roomRequest).pipe(
        tap({
          next: (newRoom) => {
            const updatedRooms = new Map(store.rooms());
            updatedRooms.set(newRoom.id, newRoom);
            let updatedRoomIdsByAreaId: Map<string, string[]> | null = null;
            if (store.roomIdsByAreaId().has(AreaId)) {
              updatedRoomIdsByAreaId = new Map(store.roomIdsByAreaId());
              updatedRoomIdsByAreaId.set(AreaId, [
                ...store.roomIdsByAreaId().get(AreaId)!,
                newRoom.id,
              ]);
            }
            patchState(store, {
              rooms: updatedRooms,
              roomIdsByAreaId:
                updatedRoomIdsByAreaId ?? store.roomIdsByAreaId(),
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
            const updatedRooms = new Map(store.rooms());
            updatedRooms.set(updatedRoom.id, updatedRoom);
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
