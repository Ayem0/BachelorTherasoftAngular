import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import dayjs from 'dayjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import { AuthService } from '../../../core/auth/services/auth.service';
import { DateRange, Event } from '../models/event';
import { EventService } from './event.service';

type EventState = {
  events: Event[];

  selectedEventCreationUserIds: string[];
  selectedEventCreationRoomId: string;

  selectedCurrentUserRange: DateRange;
  selectedWorkspaceIds: string[];

  selectedEventCreationRange: DateRange;
  selectedEventUpdateRange: DateRange;

  isLoadingCurrentUserEvents: boolean;
  isLoadingEventCreationEvents: boolean;
  isCreatingEvent: boolean;
  isUpdatingEvent: boolean;

  loadedDaysByUserId: Set<string>;
  loadedDaysByRoomId: Set<string>;
};

const initialEventState: EventState = {
  events: [],
  selectedEventCreationUserIds: [],
  selectedEventCreationRoomId: '',
  selectedCurrentUserRange: {
    start: new Date(),
    end: new Date(),
  },
  selectedEventCreationRange: {
    start: new Date(),
    end: new Date(),
  },
  selectedEventUpdateRange: {
    start: new Date(),
    end: new Date(),
  },
  isLoadingCurrentUserEvents: false,
  isLoadingEventCreationEvents: false,
  isCreatingEvent: false,
  isUpdatingEvent: false,
  loadedDaysByUserId: new Set(),
  loadedDaysByRoomId: new Set(),
  selectedWorkspaceIds: [],
};

export const EventStore = signalStore(
  { providedIn: 'root' },
  withState(initialEventState),
  withHooks({
    onInit: () => {
      // TODO listen for socket events
    },
  }),
  withComputed((store, authService = inject(AuthService)) => ({
    currentUserEvents: computed(() =>
      store
        .events()
        .filter(
          (event) =>
            event.userIds.includes(authService.currentUserInfo()!.id) &&
            (store.selectedWorkspaceIds().length === 0 ||
              store.selectedWorkspaceIds().includes(event.workspaceId)) &&
            isEventInRange(event, store.selectedCurrentUserRange())
        )
    ),
    creationEvents: computed(() =>
      store
        .events()
        .filter(
          (event) =>
            event.userIds.some((id) =>
              store.selectedEventCreationUserIds().includes(id)
            ) ||
            (event.roomId === store.selectedEventCreationRoomId() &&
              isEventInRange(event, store.selectedEventCreationRange()))
        )
    ),
  })),
  withMethods(
    (
      store,
      eventService = inject(EventService),
      authService = inject(AuthService)
    ) => ({
      setSelectedCurrentUserRange: (range: DateRange) => {
        patchState(store, {
          selectedCurrentUserRange: range,
        });
      },
      setSelectedWorkspaceIds: (workspaceIds: string[]) => {
        patchState(store, {
          selectedWorkspaceIds: workspaceIds,
        });
      },
      setSelectedEventCreationRange: (range: DateRange) => {
        patchState(store, {
          selectedEventCreationRange: range,
        });
      },
      setSelectedEventUpdateRange: (range: DateRange) => {
        patchState(store, {
          selectedEventUpdateRange: range,
        });
      },
      setSelectedEventCreationUserIds: (userIds: string[]) => {
        patchState(store, {
          selectedEventCreationUserIds: userIds,
        });
      },
      setSelectedEventCreationRoomId: (roomId: string) => {
        patchState(store, {
          selectedEventCreationRoomId: roomId,
        });
      },
      getCurrentUserEvents: rxMethod<void>(
        pipe(
          debounceTime(200),
          distinctUntilChanged(),
          filter(() => {
            const selectedRange = store.selectedCurrentUserRange();
            const loadedEvents = store.loadedDaysByUserId();
            let date = new Date(selectedRange.start);

            while (date <= selectedRange.end) {
              if (
                !loadedEvents.has(
                  `${authService.currentUserInfo()!.id}/${dayjs(date).format(
                    'YYYY/MM/DD'
                  )}`
                )
              ) {
                return true;
              }
              date = dayjs(date).add(1, 'day').toDate();
            }
            return false;
          }),
          tap(() => {
            patchState(store, {
              isLoadingCurrentUserEvents: true,
            });
          }),
          switchMap(() =>
            eventService
              .getEventsByUserId(store.selectedCurrentUserRange())
              .pipe(
                tap({
                  next: (events) => {
                    const loadedDays = new Set(store.loadedDaysByUserId());
                    let date = new Date(store.selectedCurrentUserRange().start);

                    while (date <= store.selectedCurrentUserRange().end) {
                      loadedDays.add(
                        `${authService.currentUserInfo()!.id}/${dayjs(
                          date
                        ).format('YYYY/MM/DD')}`
                      );
                      date = dayjs(date).add(1, 'day').toDate();
                    }
                    patchState(store, {
                      events: [...store.events(), ...events],
                      loadedDaysByUserId: loadedDays,
                      isLoadingCurrentUserEvents: false,
                    });
                  },
                  error: (error) => {
                    console.error(error);
                    // TODO handle error
                    patchState(store, {
                      isLoadingCurrentUserEvents: false,
                    });
                  },
                })
              )
          )
        )
      ),
    })
  )
);

function isEventInRange(event: Event, range: DateRange) {
  // event with same date or starting before and ending after
  return (
    (event.startDate <= range.start && event.endDate >= range.end) ||
    // event starting after and ending before
    (event.startDate > range.start && event.endDate < range.end) ||
    // event starting before and ending before
    (event.startDate < range.start &&
      event.endDate > range.start &&
      event.endDate < range.end) ||
    // event starting after and ending after
    (event.startDate > range.start &&
      event.endDate > range.end &&
      event.startDate < range.end)
  );
}
