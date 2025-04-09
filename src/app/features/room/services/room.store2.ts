import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Id } from '../../../shared/models/entity';
import { StoreRoom } from '../models/room';

type RoomState = {
  rooms: Map<Id, StoreRoom>;
};

const initialRoomState: RoomState = {
  rooms: new Map(),
};

export const RoomStore2 = signalStore(
  { providedIn: 'root' },
  withState(initialRoomState),
  withComputed((store) => ({
    roomsArr: computed(() => Array.from(store.rooms().values())),
  })),
  withMethods((store) => ({
    setRoom(room: StoreRoom) {
      patchState(store, {
        rooms: new Map([...store.rooms(), [room.id, room]]),
      });
    },
    setRooms(rooms: StoreRoom[]) {
      const newRooms = new Map(store.rooms());
      rooms.forEach((wr) => {
        newRooms.set(wr.id, wr);
      });
      patchState(store, {
        rooms: newRooms,
      });
    },
    deleteRoom(id: Id) {
      const newRooms = new Map(store.rooms());
      newRooms.delete(id);
      patchState(store, {
        rooms: newRooms,
      });
    },
  }))
);
