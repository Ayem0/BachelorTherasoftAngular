// import { computed, inject } from '@angular/core';
// import {
//   patchState,
//   signalStore,
//   withComputed,
//   withHooks,
//   withMethods,
//   withState,
// } from '@ngrx/signals';
// import { rxMethod } from '@ngrx/signals/rxjs-interop';
// import dayjs from 'dayjs';
// import {
//   catchError,
//   debounceTime,
//   distinctUntilChanged,
//   filter,
//   map,
//   of,
//   pipe,
//   switchMap,
//   tap,
// } from 'rxjs';
// import { AuthService } from '../../../core/auth/services/auth.service';
// import { DateRange, Event, EventRequest } from '../models/event';
// import { EventService } from './event.service';

// type EventState = {
//   events: Event[];

//   selectedEventDialogUserIds: string[];
//   selectedEventDialogRoomId: string;

//   selectedCurrentUserRange: DateRange;
//   selectedWorkspaceIds: string[];

//   selectedEventDialogRange: DateRange;

//   isLoadingCurrentUserEvents: boolean;
//   isLoadingDialogEvents: boolean;

//   loadedDaysByUserId: Set<string>;
//   loadedDaysByRoomId: Set<string>;
// };

// const initialEventState: EventState = {
//   events: [],
//   selectedEventDialogUserIds: [],
//   selectedEventDialogRoomId: '',
//   selectedCurrentUserRange: {
//     start: new Date(),
//     end: new Date(),
//   },
//   selectedWorkspaceIds: [],
//   selectedEventDialogRange: {
//     start: new Date(),
//     end: new Date(),
//   },
//   isLoadingCurrentUserEvents: false,
//   isLoadingDialogEvents: false,
//   loadedDaysByUserId: new Set(),
//   loadedDaysByRoomId: new Set(),
// };

// export const EventStore2 = signalStore(
//   { providedIn: 'root', protectedState: true },
//   withState(initialEventState),
//   withHooks({
//     onInit: () => {
//       // TODO listen for socket events
//     },
//   }),
//   withComputed((store, authService = inject(AuthService)) => ({
//     currentUserEvents: computed(() =>
//       store
//         .events()
//         .filter(
//           (event) =>
//             event.userIds.includes(authService.currentUserInfo()!.id) &&
//             (store.selectedWorkspaceIds().length === 0 ||
//               store.selectedWorkspaceIds().includes(event.workspaceId)) &&
//             isEventInRange(event, store.selectedCurrentUserRange())
//         )
//     ),
//     dialogEvents: computed(() =>
//       store
//         .events()
//         .filter(
//           (event) =>
//             event.userIds.some((id) =>
//               store.selectedEventDialogUserIds().includes(id)
//             ) ||
//             (event.roomId === store.selectedEventDialogRoomId() &&
//               isEventInRange(event, store.selectedEventDialogRange()))
//         )
//     ),
//   })),
//   withMethods(
//     (
//       store,
//       eventService = inject(EventService),
//       authService = inject(AuthService)
//     ) => ({
//       // Utils
//       setSelectedCurrentUserRange: (range: DateRange) => {
//         patchState(store, {
//           selectedCurrentUserRange: range,
//         });
//       },
//       setSelectedWorkspaceIds: (workspaceIds: string[]) => {
//         patchState(store, {
//           selectedWorkspaceIds: workspaceIds,
//         });
//       },
//       setSelectedEventDialogRange: (range: DateRange) => {
//         patchState(store, {
//           selectedEventDialogRange: range,
//         });
//       },
//       setSelectedEventDialogUserIds: (userIds: string[]) => {
//         patchState(store, {
//           selectedEventDialogUserIds: userIds,
//         });
//       },
//       setSelectedEventDialogRoomId: (roomId: string) => {
//         patchState(store, {
//           selectedEventDialogRoomId: roomId,
//         });
//       },
//       // Methods
//       getCurrentUserEvents: rxMethod<void>(
//         pipe(
//           debounceTime(200),
//           distinctUntilChanged(),
//           filter(() =>
//             checkSet(
//               store.loadedDaysByUserId(),
//               authService.currentUserInfo()!.id,
//               store.selectedCurrentUserRange()
//             )
//           ),
//           tap(() => {
//             patchState(store, {
//               isLoadingCurrentUserEvents: true,
//             });
//           }),
//           switchMap(() =>
//             eventService
//               .getEventsByUserId(
//                 authService.currentUserInfo()!.id,
//                 store.selectedCurrentUserRange()
//               )
//               .pipe(
//                 tap({
//                   next: (events) => {
//                     patchState(store, {
//                       events: [...store.events(), ...events],
//                       loadedDaysByUserId: addToSet(
//                         store.loadedDaysByUserId(),
//                         authService.currentUserInfo()!.id,
//                         store.selectedCurrentUserRange()
//                       ),
//                       isLoadingCurrentUserEvents: false,
//                     });
//                   },
//                   error: (error) => {
//                     console.error(error);
//                     // TODO handle error
//                     patchState(store, {
//                       isLoadingCurrentUserEvents: false,
//                     });
//                   },
//                 })
//               )
//           )
//         )
//       ),

//       getDialogEvents: rxMethod<void>(
//         pipe(
//           // debounceTime(200),
//           // // distinctUntilChanged(),
//           // filter(() =>
//           //   checkSetMultiple(
//           //     store.loadedDaysByUserId(),
//           //     store.selectedEventDialogUserIds(),
//           //     store.selectedEventDialogRange()
//           //   )
//           // ),
//           tap(() => {
//             patchState(store, {
//               isLoadingCurrentUserEvents: true,
//             });
//           }),
//           switchMap(() =>
//             eventService
//               .getDialogEvents(
//                 store.selectedEventDialogUserIds(),
//                 store.selectedEventDialogRoomId(),
//                 store.selectedEventDialogRange()
//               )
//               .pipe(
//                 tap({
//                   next: (events) => {
//                     patchState(store, {
//                       events: [...store.events(), ...events],
//                       // loadedDaysByUserId: addToSetMultiple(
//                       //   store.loadedDaysByUserId(),
//                       //   store.selectedEventDialogUserIds(),
//                       //   store.selectedEventDialogRange()
//                       // ),
//                       // loadedDaysByRoomId: addToSet(
//                       //   store.loadedDaysByRoomId(),
//                       //   store.selectedEventDialogRoomId(),
//                       //   store.selectedEventDialogRange()
//                       // ),
//                       isLoadingCurrentUserEvents: false,
//                     });
//                   },
//                   error: (error) => {
//                     console.error(error);
//                     // TODO handle error
//                     patchState(store, {
//                       isLoadingCurrentUserEvents: false,
//                     });
//                   },
//                 })
//               )
//           )
//         )
//       ),

//       createEvent(req: EventRequest) {
//         return eventService.createEvent(req).pipe(
//           switchMap((event) => {
//             patchState(store, {
//               events: [...store.events(), event],
//             });
//             return of(true);
//           }),
//           catchError((error) => {
//             console.error(error);
//             return of(false);
//           })
//         );
//       },

//       //     tap((event) => {
//       //       patchState(store, {
//       //         events: [...store.events(), event],
//       //       });
//       //     }),
//       //     map(() => true),
//       //     catchError((error) => {
//       //       console.error(error);
//       //       return of(false);
//       //     })
//       //   );
//       // },

//       updateEvent(id: string, req: EventRequest) {
//         return eventService.updateEvent(id, req).pipe(
//           tap((event) => {
//             patchState(store, {
//               events: store
//                 .events()
//                 .map((e) => (e.id === event.id ? event : e)),
//             });
//           }),
//           map(() => true),
//           catchError((error) => {
//             console.error(error);
//             return of(false);
//           })
//         );
//       },
//     })
//   )
// );

// function addToSet(set: Set<string>, value: string, dateRange: DateRange) {
//   let date = new Date(dateRange.start);
//   while (date <= dateRange.end) {
//     set.add(`${value}/${dayjs(date).format('YYYY/MM/DD')}`);
//     date = dayjs(date).add(1, 'day').toDate();
//   }
//   return set;
// }

// function addToSetMultiple(
//   set: Set<string>,
//   values: string[],
//   dateRange: DateRange
// ) {
//   let date = new Date(dateRange.start);
//   while (date <= dateRange.end) {
//     for (const value of values) {
//       set.add(`${value}/${dayjs(date).format('YYYY/MM/DD')}`);
//     }
//     date = dayjs(date).add(1, 'day').toDate();
//   }
//   return set;
// }

// function checkSet(set: Set<string>, value: string, dateRange: DateRange) {
//   let date = new Date(dateRange.start);
//   while (date <= dateRange.end) {
//     if (!set.has(`${value}/${dayjs(date).format('YYYY/MM/DD')}`)) {
//       return true;
//     }
//     date = dayjs(date).add(1, 'day').toDate();
//   }
//   return false;
// }

// function checkSetMultiple(
//   set: Set<string>,
//   values: string[],
//   dateRange: DateRange
// ) {
//   let date = new Date(dateRange.start);
//   while (date <= dateRange.end) {
//     for (const value of values) {
//       if (!set.has(`${value}/${dayjs(date).format('YYYY/MM/DD')}`)) {
//         return true;
//       }
//     }
//     date = dayjs(date).add(1, 'day').toDate();
//   }
//   return false;
// }

// function isEventInRange(event: Event, range: DateRange) {
//   return (
//     // event with same date or starting before and ending after
//     (event.startDate <= range.start && event.endDate >= range.end) ||
//     // event starting after and ending before
//     (event.startDate > range.start && event.endDate < range.end) ||
//     // event starting before and ending before
//     (event.startDate < range.start &&
//       event.endDate > range.start &&
//       event.endDate < range.end) ||
//     // event starting after and ending after
//     (event.startDate > range.start &&
//       event.endDate > range.end &&
//       event.startDate < range.end)
//   );
// }
