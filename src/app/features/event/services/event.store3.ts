import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { StoreEvent } from '../models/event';

type Year = number;
type Month = number;
type Day = number;
type Id = string;
type EventLoadedKey = `${Id}/${Year}/${Month}/${Day}`;

type EventState = {
  events: Map<Id, StoreEvent>; // string is id
  userLoadedDay: Set<EventLoadedKey>;
  roomLoadedDay: Set<EventLoadedKey>;
};

const initialEventState: EventState = {
  events: new Map(),
  userLoadedDay: new Set(),
  roomLoadedDay: new Set(),
};

export const EventStore3 = signalStore(
  { providedIn: 'root' },
  withState(initialEventState),
  withComputed((store) => ({
    eventsArr: computed(() => Array.from(store.events().values())),
  })),
  withMethods((store) => ({
    setUserLoadedDay(keys: EventLoadedKey[]) {
      patchState(store, {
        userLoadedDay: new Set([...store.userLoadedDay(), ...keys]),
      });
    },
    setRoomLoadedDay(keys: EventLoadedKey[]) {
      patchState(store, {
        roomLoadedDay: new Set([...store.roomLoadedDay(), ...keys]),
      });
    },
    setEvent(event: StoreEvent) {
      patchState(store, {
        events: new Map(store.events()).set(event.id, event),
      });
    },
    deleteEvent(id: Id) {
      const newEvents = new Map(store.events());
      newEvents.delete(id);
      patchState(store, {
        events: newEvents,
      });
    },
    setEvents(events: StoreEvent[]) {
      const newEvents = new Map(store.events());
      events.forEach((event) => {
        newEvents.set(event.id, event);
      });
      patchState(store, {
        events: newEvents,
      });
    },
  }))
);
