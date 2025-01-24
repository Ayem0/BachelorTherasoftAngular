import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import dayjs from 'dayjs';
import { Observable, of, tap } from 'rxjs';
import { Interval } from '../../../shared/models/interval';
import { Event } from '../models/event';
import { EventService } from './event.service';

type EventState = {
  events: Map<string, Event>; // string is id
  eventIdsByRoomId: Map<string, string[]>;
  // eventByAgenda: Map<string, string[]>; // key is "{userid}/{day}/{week}/{month}/{year}"
  loading: boolean;
  updating: boolean;
  creating: boolean;
  error: string | null;
};

const date = dayjs(new Date()).format('w');
const initialEventState: EventState = {
  eventIdsByRoomId: new Map(),
  events: new Map(),
  loading: false,
  creating: false,
  updating: false,
  error: null,
};

export const EventStore = signalStore(
  { providedIn: 'root' },
  withState(initialEventState),
  withMethods((store, eventService = inject(EventService)) => ({
    getEventsByRoomId(
      roomId: string,
      month: number,
      year: number,
      day?: number,
      week?: number
    ): Observable<Event[]> {
      patchState(store, { loading: true });
      if (store.eventIdsByRoomId().has(roomId)) {
        const ids = store.eventIdsByRoomId().get(roomId)!;
        patchState(store, { loading: false });
        return of(ids.map((x) => store.events().get(x)!));
      }
      return eventService
        .getEventsByRoomId(roomId, month, year, day, week)
        .pipe(
          tap({
            next: (events) => {
              const updatedeventIdsByRoomId = new Map(store.eventIdsByRoomId());
              updatedeventIdsByRoomId.set(
                roomId,
                events.map((x) => x.id)
              );
              const updatedEvents = new Map(store.events());
              events.forEach((x) => updatedEvents.set(x.id, x));
              patchState(store, {
                events: updatedEvents,
                eventIdsByRoomId: updatedeventIdsByRoomId,
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

    createEvent(
      roomId: string,
      startDate: Date,
      endDate: Date,
      eventCategoryId: string,
      tagIds: string[],
      participantIds: string[],
      userIds: string[],
      description?: string,
      repetitionInterval?: Interval,
      repetitionNumber?: number,
      repetitionEndDate?: Date
    ) {
      patchState(store, { creating: true });
      return eventService
        .createEvent(
          roomId,
          startDate,
          endDate,
          eventCategoryId,
          participantIds,
          tagIds,
          userIds,
          description,
          repetitionInterval,
          repetitionNumber,
          repetitionEndDate
        )
        .pipe(
          tap({
            next: (newEvent) => {
              const updatedEvents = new Map(store.events());
              updatedEvents.set(newEvent.id, newEvent);
              let updatedeventIdsByRoomId: Map<string, string[]> | null = null;
              if (store.eventIdsByRoomId().has(roomId)) {
                updatedeventIdsByRoomId = new Map(store.eventIdsByRoomId());
                updatedeventIdsByRoomId.set(roomId, [
                  ...store.eventIdsByRoomId().get(roomId)!,
                  newEvent.id,
                ]);
              }
              patchState(store, {
                events: updatedEvents,
                eventIdsByRoomId:
                  updatedeventIdsByRoomId ?? store.eventIdsByRoomId(),
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

    updateEvent(
      id: string,
      roomId: string,
      startDate: Date,
      endDate: Date,
      eventCategoryId: string,
      tagIds: string[],
      participantIds: string[],
      userIds: string[],
      description?: string,
      repetitionInterval?: Interval,
      repetitionNumber?: number,
      repetitionEndDate?: Date
    ) {
      patchState(store, { updating: true });
      return eventService
        .updateEvent(
          id,
          roomId,
          startDate,
          endDate,
          eventCategoryId,
          participantIds,
          tagIds,
          userIds,
          description,
          repetitionInterval,
          repetitionNumber,
          repetitionEndDate
        )
        .pipe(
          tap({
            next: (updatedEvent) => {
              const updatedEvents = new Map(store.events());
              updatedEvents.set(updatedEvent.id, updatedEvent);
              patchState(store, {
                events: updatedEvents,
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
