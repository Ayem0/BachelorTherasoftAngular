import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import dayjs from 'dayjs';
import { of, tap } from 'rxjs';
import { Interval } from '../../../shared/models/interval';
import { Event } from '../models/event';
import { EventService } from './event.service';

type EventState = {
  events: Map<string, Event>; // string is id
  eventIdsByUserId: Map<
    string,
    Map<number, Map<number, Map<number, string[]>>>
  >; // userid, year, month, day, eventIds
  eventIdsByRoomId: Map<
    string,
    Map<number, Map<number, Map<number, string[]>>>
  >; // roomId, year, month, day, eventIds
  loading: boolean;
  updating: boolean;
  creating: boolean;
  error: string | null;
};

const initialEventState: EventState = {
  events: new Map(),
  eventIdsByUserId: new Map(),
  eventIdsByRoomId: new Map(),
  loading: false,
  creating: false,
  updating: false,
  error: null,
};

export const EventStore = signalStore(
  { providedIn: 'root' },
  withState(initialEventState),
  withMethods((store, eventService = inject(EventService)) => ({
    getEventsByUserId(id: string, start: Date, end: Date) {
      const ids = this.lookMap(id, start, end, store.eventIdsByUserId());
      return ids
        ? of(ids.map((id) => store.events().get(id)!))
        : eventService.getEventsByUser(start, end).pipe(
            tap((events) => {
              const updatedEvents = new Map(store.events());
              events.forEach((event) => {
                updatedEvents.set(event.id, event);
              });
              const updatedEventIdsByUserId = this.updateMap(
                id,
                start,
                end,
                events,
                store.eventIdsByUserId()
              );
              patchState(store, {
                events: updatedEvents,
                eventIdsByUserId: updatedEventIdsByUserId,
              });
            })
          );
    },

    getEventsByRoomId(id: string, start: Date, end: Date) {
      const ids = this.lookMap(id, start, end, store.eventIdsByRoomId());
      return ids
        ? of(ids.map((id) => store.events().get(id)!))
        : eventService.getEventsByRoomId(id, start, end).pipe(
            tap((events) => {
              const updatedEvents = new Map(store.events());
              const updatedEventIdsByRoomId = this.updateMap(
                id,
                start,
                end,
                events,
                store.eventIdsByRoomId()
              );
              events.forEach((event) => {
                updatedEvents.set(event.id, event);
              });
              patchState(store, {
                events: updatedEvents,
                eventIdsByRoomId: updatedEventIdsByRoomId,
              });
            })
          );
    },

    lookMap(
      id: string,
      start: Date,
      end: Date,
      map: Map<string, Map<number, Map<number, Map<number, string[]>>>>
    ) {
      let date = new Date(start);
      const ids: string[] = [];
      while (date <= end) {
        const year = date.getFullYear();
        const day = date.getDate();
        const month = date.getMonth();
        if (map.get(id)?.get(year)?.get(month)?.has(day)) {
          ids.push(...map.get(id)!.get(year)!.get(month)!.get(day)!);
          date = dayjs(date).add(1, 'day').toDate();
        } else {
          return null;
        }
      }
      return ids;
    },

    updateMap(
      id: string,
      start: Date,
      end: Date,
      events: Event[],
      map: Map<string, Map<number, Map<number, Map<number, string[]>>>>
    ) {
      let date = new Date(start);
      while (date <= end) {
        const year = date.getFullYear();
        const day = date.getDate();
        const month = date.getMonth();
        if (!map.has(id)) {
          map.set(id, new Map());
        }
        const idMap = map.get(id)!; // userid or roomid
        if (!idMap.has(year)) {
          idMap.set(year, new Map());
        }
        const yearMap = idMap.get(year)!;
        if (!yearMap.has(month)) {
          yearMap.set(month, new Map());
        }
        const monthMap = yearMap.get(month)!;
        monthMap.set(
          day,
          events
            .filter(
              (x) =>
                dayjs(x.startDate).format('YYYY/MM/DD') ===
                dayjs(date).format('YYYY/MM/DD')
            )
            .map((x) => x.id)
        );
        date = dayjs(date).add(1, 'day').toDate();
      }
      return map;
    },

    // getEventsByRoomId(
    //   roomId: string,
    //   month: number,
    //   year: number,
    //   day?: number,
    //   week?: number
    // ): Observable<Event[]> {
    //   patchState(store, { loading: true });
    //   if (store.eventIdsByRoomId().has(roomId)) {
    //     const ids = store.eventIdsByRoomId().get(roomId)!;
    //     patchState(store, { loading: false });
    //     return of(ids.map((x) => store.events().get(x)!));
    //   }
    //   return eventService
    //     .getEventsByRoomId(roomId, month, year, day, week)
    //     .pipe(
    //       tap({
    //         next: (events) => {
    //           const updatedeventIdsByRoomId = new Map(store.eventIdsByRoomId());
    //           updatedeventIdsByRoomId.set(
    //             roomId,
    //             events.map((x) => x.id)
    //           );
    //           const updatedEvents = new Map(store.events());
    //           events.forEach((x) => updatedEvents.set(x.id, x));
    //           patchState(store, {
    //             events: updatedEvents,
    //             eventIdsByRoomId: updatedeventIdsByRoomId,
    //             loading: false,
    //             error: null,
    //           });
    //         },
    //         error: (error: Error) => {
    //           patchState(store, {
    //             loading: false,
    //             error: error.message,
    //           });
    //         },
    //       })
    //     );
    // },

    // createEvent(
    //   roomId: string,
    //   startDate: Date,
    //   endDate: Date,
    //   eventCategoryId: string,
    //   tagIds: string[],
    //   participantIds: string[],
    //   userIds: string[],
    //   description?: string,
    //   repetitionInterval?: Interval,
    //   repetitionNumber?: number,
    //   repetitionEndDate?: Date
    // ) {
    //   patchState(store, { creating: true });
    //   return eventService
    //     .createEvent(
    //       roomId,
    //       startDate,
    //       endDate,
    //       eventCategoryId,
    //       participantIds,
    //       tagIds,
    //       userIds,
    //       description,
    //       repetitionInterval,
    //       repetitionNumber,
    //       repetitionEndDate
    //     )
    //     .pipe(
    //       tap({
    //         next: (newEvent) => {
    //           const updatedEvents = new Map(store.events());
    //           updatedEvents.set(newEvent.id, newEvent);
    //           let updatedeventIdsByRoomId: Map<string, string[]> | null = null;
    //           if (store.eventIdsByRoomId().has(roomId)) {
    //             updatedeventIdsByRoomId = new Map(store.eventIdsByRoomId());
    //             updatedeventIdsByRoomId.set(roomId, [
    //               ...store.eventIdsByRoomId().get(roomId)!,
    //               newEvent.id,
    //             ]);
    //           }
    //           patchState(store, {
    //             events: updatedEvents,
    //             eventIdsByRoomId:
    //               updatedeventIdsByRoomId ?? store.eventIdsByRoomId(),
    //             creating: false,
    //             error: null,
    //           });
    //         },
    //         error: (error: Error) => {
    //           patchState(store, { creating: false, error: error.message });
    //         },
    //       })
    //     );
    // },

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
