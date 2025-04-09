// import { inject } from '@angular/core';
// import {
//   patchState,
//   signalStore,
//   withComputed,
//   withHooks,
//   withMethods,
//   withState,
// } from '@ngrx/signals';
// import dayjs from 'dayjs';
// import { of, tap } from 'rxjs';
// import { updateModelMap } from '../../../shared/utils/store.utils';
// import { Event, EventRequest } from '../models/event';
// import { EventService } from './event.service';

// type EventState = {
//   events: Map<string, Event>; // string is id
//   eventIdsByUserId: Map<
//     string,
//     Map<number, Map<number, Map<number, string[]>>>
//   >; // userid, year, month, day, eventIds
//   eventIdsByRoomId: Map<
//     string,
//     Map<number, Map<number, Map<number, string[]>>>
//   >; // roomId, year, month, day, eventIds
//   loading: boolean;
//   updating: boolean;
//   creating: boolean;
//   error: string | null;
// };

// const initialEventState: EventState = {
//   events: new Map(),
//   eventIdsByUserId: new Map(),
//   eventIdsByRoomId: new Map(),
//   loading: false,
//   creating: false,
//   updating: false,
//   error: null,
// };

// export const EventStore = signalStore(
//   { providedIn: 'root' },
//   withState(initialEventState),
//   withHooks({
//     onInit: () => {},
//   }),
//   withComputed((store) => ({})),
//   withMethods((store, eventService = inject(EventService)) => ({
//     getEventsByUserId(id: string, start: Date, end: Date) {
//       const ids = searchMap(id, start, end, store.eventIdsByUserId());
//       return ids
//         ? of(ids.map((id) => store.events().get(id)!))
//         : eventService.getEventsByUserId(id, { start, end }).pipe(
//             tap((events) => {
//               const updatedEvents = updateModelMap(store.events(), events);
//               const updatedEventIdsByUserId = updateMap(
//                 id,
//                 start,
//                 end,
//                 events,
//                 store.eventIdsByUserId()
//               );
//               patchState(store, {
//                 events: updatedEvents,
//                 eventIdsByUserId: updatedEventIdsByUserId,
//               });
//             })
//           );
//     },

//     getEventsByRoomId(id: string, start: Date, end: Date) {
//       const ids = searchMap(id, start, end, store.eventIdsByRoomId());
//       return ids
//         ? of(ids.map((id) => store.events().get(id)!))
//         : eventService.getEventsByRoomId(id, start, end).pipe(
//             tap((events) => {
//               const updatedEvents = updateModelMap(store.events(), events);
//               const updatedEventIdsByRoomId = updateMap(
//                 id,
//                 start,
//                 end,
//                 events,
//                 store.eventIdsByRoomId()
//               );
//               patchState(store, {
//                 events: updatedEvents,
//                 eventIdsByRoomId: updatedEventIdsByRoomId,
//               });
//             })
//           );
//     },

//     createEvent(event: EventRequest) {
//       patchState(store, { creating: true });
//       return eventService.createEvent(event).pipe(
//         tap({
//           next: (newEvent) => {
//             const updatedEvents = updateModelMap(store.events(), [newEvent]);
//             const updatedEventIdsByRoomId = addEventToMap(
//               [newEvent.roomId],
//               newEvent,
//               store.eventIdsByRoomId()
//             );
//             const updatedEventIdsByUserId = addEventToMap(
//               newEvent.userIds,
//               newEvent,
//               store.eventIdsByUserId()
//             );
//             patchState(store, {
//               events: updatedEvents,
//               eventIdsByRoomId: updatedEventIdsByRoomId,
//               eventIdsByUserId: updatedEventIdsByUserId,
//               creating: false,
//               error: null,
//             });
//           },
//           error: (error: Error) => {
//             patchState(store, { creating: false, error: error.message });
//           },
//         })
//       );
//     },

//     updateEvent(id: string, event: EventRequest) {
//       patchState(store, { updating: true });
//       return eventService.updateEvent(id, event).pipe(
//         tap({
//           next: (updatedEvent) => {
//             const updatedEvents = updateModelMap(store.events(), [
//               updatedEvent,
//             ]);
//             patchState(store, {
//               events: updatedEvents,
//               updating: false,
//               error: null,
//             });
//           },
//           error: (error: Error) => {
//             patchState(store, { updating: false, error: error.message });
//           },
//         })
//       );
//     },
//   }))
// );

// function searchMap(
//   id: string,
//   start: Date,
//   end: Date,
//   map: Map<string, Map<number, Map<number, Map<number, string[]>>>>
// ) {
//   let date = new Date(start);
//   const ids: string[] = [];
//   while (date <= end) {
//     const year = date.getFullYear();
//     const day = date.getDate();
//     const month = date.getMonth();
//     if (map.get(id)?.get(year)?.get(month)?.has(day)) {
//       ids.push(...map.get(id)!.get(year)!.get(month)!.get(day)!);
//       date = dayjs(date).add(1, 'day').toDate();
//     } else {
//       return null;
//     }
//   }
//   return ids;
// }

// function updateMap(
//   id: string,
//   start: Date,
//   end: Date,
//   events: Event[],
//   map: Map<string, Map<number, Map<number, Map<number, string[]>>>>
// ) {
//   let date = new Date(start);
//   while (date <= end) {
//     const year = date.getFullYear();
//     const day = date.getDate();
//     const month = date.getMonth();
//     if (!map.has(id)) {
//       map.set(id, new Map());
//     }
//     const idMap = map.get(id)!; // userid or roomid
//     if (!idMap.has(year)) {
//       idMap.set(year, new Map());
//     }
//     const yearMap = idMap.get(year)!;
//     if (!yearMap.has(month)) {
//       yearMap.set(month, new Map());
//     }
//     const monthMap = yearMap.get(month)!;
//     monthMap.set(
//       day,
//       events
//         .filter((x) => {
//           const eventStart = dayjs(x.startDate);
//           const eventEnd = dayjs(x.endDate);
//           const currentDay = dayjs(date);
//           // Filters where date is
//           return (
//             (currentDay.isSame(eventStart, 'day') ||
//               currentDay.isBefore(eventStart, 'day')) &&
//             (currentDay.isSame(eventEnd, 'day') ||
//               currentDay.isAfter(eventEnd, 'day'))
//           );
//         })
//         .map((x) => x.id)
//     );
//     date = dayjs(date).add(1, 'day').toDate();
//   }
//   return map;
// }

// /** Add event to user or room map (Ids = users or room id) */
// function addEventToMap(
//   ids: string[],
//   event: Event,
//   map: Map<string, Map<number, Map<number, Map<number, string[]>>>>
// ) {
//   const start = event.startDate;
//   const end = event.endDate;
//   let date = new Date(start);
//   while (date <= end) {
//     const year = date.getFullYear();
//     const day = date.getDate();
//     const month = date.getMonth();
//     ids.forEach((id) => {
//       if (map.get(id)?.get(year)?.get(month)?.has(day)) {
//         const eventIds = map.get(id)!.get(year)!.get(month)!.get(day)!;
//         map
//           .get(id)!
//           .get(year)!
//           .get(month)!
//           .set(day, [...eventIds, event.id]);
//       }
//     });
//     date = dayjs(date).add(1, 'day').toDate();
//   }
//   return map;
// }
