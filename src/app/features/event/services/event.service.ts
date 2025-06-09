import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { catchError, debounceTime, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UNKNOW_USER, User } from '../../../core/auth/models/auth';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Id } from '../../../shared/models/entity';
import { DateService } from '../../../shared/services/date/date.service';
import { LocaleService } from '../../../shared/services/locale/locale.service';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
import { isIsRange } from '../../../shared/utils/event.utils';
import {
  EventCategory,
  UNKNOWN_EVENT_CATEGORY,
} from '../../event-category/models/event-category';
import {
  Participant,
  UNKNOWN_PARTICIPANT,
} from '../../participant/models/participant';
import { Room, UNKNOWN_ROOM } from '../../room/models/room';
import { Tag, UNKNOWN_TAG } from '../../tag/models/tag';
import { UNKNOW_WORKSPACE, Workspace } from '../../workspace/models/workspace';
import {
  DateRange,
  Event,
  EventKey,
  EventRequest,
  UNKNOWN_EVENT,
} from '../models/event';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly sonner = inject(SonnerService);
  private readonly auth = inject(AuthService);
  private readonly store = inject(Store);
  private readonly locale = inject(LocaleService);
  private readonly date = inject(DateService);

  public detailedEvent(id: Id | null | undefined): Signal<Event<{
    eventCategory: EventCategory;
    room: Room;
    tags: Tag[];
    workspace: Workspace;
    users: User[];
    participants: Participant[];
  }> | null> {
    return computed(() => {
      if (!id) return null;
      const event = this.store.events().get(id) ?? UNKNOWN_EVENT;
      return {
        ...event,
        workspace:
          event.workspaceId && this.store.workspaces().has(event.workspaceId)
            ? this.store.workspaces().get(event.workspaceId)!
            : UNKNOW_WORKSPACE,
        room:
          event.roomId && this.store.rooms().has(event.roomId)
            ? this.store.rooms().get(event.roomId)!
            : UNKNOWN_ROOM,
        eventCategory:
          event.eventCategoryId &&
          this.store.eventCategories().has(event.eventCategoryId)
            ? this.store.eventCategories().get(event.eventCategoryId)!
            : UNKNOWN_EVENT_CATEGORY,
        tags: event.tagIds
          ? event.tagIds.map(
              (tagId) => this.store.tags().get(tagId) ?? UNKNOWN_TAG
            )
          : [],
        users: event.userIds
          ? event.userIds.map(
              (userId) => this.store.users().get(userId) ?? UNKNOW_USER
            )
          : [],
        participants: event.participantIds
          ? event.participantIds.map(
              (participantId) =>
                this.store.participants().get(participantId) ??
                UNKNOWN_PARTICIPANT
            )
          : [],
      };
    });
  }

  public agendaEvents(dateRange: Signal<DateRange>): Signal<
    Event<{
      eventCategory: EventCategory;
      room: Room;
      tags: Tag[];
      workspace: Workspace;
    }>[]
  > {
    return computed(() => {
      const id = this.auth.currentUserInfo()?.id ?? '';
      const range = dateRange();
      const keys = this.createKeys(id, range);
      const ids = Array.from(
        new Set(
          keys
            .map((key) => this.store.usersEvents().get(key))
            .filter((x) => !!x)
            .flatMap((s) => [...s])
        )
      );
      const events = ids.map(
        (id) => this.store.events().get(id) ?? UNKNOWN_EVENT
      );
      const mapped: Event<{
        eventCategory: EventCategory;
        room: Room;
        tags: Tag[];
        workspace: Workspace;
      }>[] = events.map((event) => ({
        ...event,
        workspace:
          event.workspaceId && this.store.workspaces().has(event.workspaceId)
            ? this.store.workspaces().get(event.workspaceId)!
            : UNKNOW_WORKSPACE,
        room:
          event.roomId && this.store.rooms().has(event.roomId)
            ? this.store.rooms().get(event.roomId)!
            : UNKNOWN_ROOM,
        eventCategory:
          event.eventCategoryId &&
          this.store.eventCategories().has(event.eventCategoryId)
            ? this.store.eventCategories().get(event.eventCategoryId)!
            : UNKNOWN_EVENT_CATEGORY,
        tags: event.tagIds
          ? event.tagIds.map(
              (tagId) => this.store.tags().get(tagId) ?? UNKNOWN_TAG
            )
          : [],
      }));
      return mapped;
    });
  }

  // public dialogEventsByRange(
  //   dateRange: DateRange,
  //   userIds: string[],
  //   roomId: string
  // ): Signal<Event[]> {
  //   return computed(() =>
  //     this.eventStore
  //       .eventsArr()
  //       .filter(
  //         (event) =>
  //           isIsRange(event, dateRange) &&
  //           event.roomId === roomId &&
  //           event.participantIds.some((id) => userIds.includes(id))
  //       )
  //   );
  // }

  public getById(id: string) {
    if (this.hasEventDetails(id)) return of(this.detailedEvent(id)());
    return this.http
      .get<
        Event<{
          eventCategory: EventCategory;
          participants: Participant[];
          room: Room;
          tags: Tag[];
          users: User[];
          workspace: Workspace;
        }>
      >(`${environment.apiUrl}/event/${id}`)
      .pipe(
        debounceTime(150),
        tap((event) => {
          this.setEventToStore(event);
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.locale.translate('event.get.error'));
          return of(null);
        })
      );
  }

  public createEvent(req: EventRequest): Observable<Event<{
    eventCategory: EventCategory;
    tags: Tag[];
    workspace: Workspace;
    room: Room;
    users: User[];
    participants: Participant[];
  }> | null> {
    const startDate = this.date.toUtcString(req.startDate);
    const endDate = this.date.toUtcString(req.endDate);
    console.log(startDate, endDate);
    return this.http
      .post<
        Event<{
          eventCategory: EventCategory;
          tags: Tag[];
          workspace: Workspace;
          room: Room;
          users: User[];
          participants: Participant[];
        }>
      >(`${environment.apiUrl}/event`, {
        ...req,
        startDate: startDate,
        endDate: endDate,
      })

      .pipe(
        debounceTime(150),
        tap((event) => {
          this.setEventToStore(event);
          event.users.forEach((user) => {
            const keys = this.createKeys(user.id, {
              start: req.startDate,
              end: req.endDate,
            });
            keys.forEach((key) =>
              this.store.addToRelation('usersEvents', key, event.id)
            );
          });
          this.sonner.success(
            this.locale.translate('event.create.success'),
            this.date.format(event.startDate, 'dddd, MMMM DD, YYYY [at] HH:mm')
          );
        }),
        catchError((err) => {
          console.error('Error creating event:', err);
          this.sonner.error(this.locale.translate('event.create.error'));
          return of(null);
        })
      );
  }

  public updateEvent(
    id: Id,
    req: EventRequest
  ): Observable<Event<{
    eventCategory: EventCategory;
    tags: Tag[];
    workspace: Workspace;
    room: Room;
    users: User[];
    participants: Participant[];
  }> | null> {
    const startDate = this.date.toUtcString(req.startDate);
    const endDate = this.date.toUtcString(req.endDate);
    console.log(startDate, endDate);
    return this.http
      .put<
        Event<{
          eventCategory: EventCategory;
          tags: Tag[];
          workspace: Workspace;
          room: Room;
          users: User[];
          participants: Participant[];
        }>
      >(`${environment.apiUrl}/event/${id}`, {
        ...req,
        startDate: startDate,
        endDate: endDate,
      })

      .pipe(
        debounceTime(150),
        tap((event) => {
          this.setEventToStore(event);
          event.users.forEach((user) => {
            const keys = this.createKeys(user.id, {
              start: req.startDate,
              end: req.endDate,
            });
            keys.forEach((key) =>
              this.store.addToRelation('usersEvents', key, event.id)
            );
          });
          this.sonner.success(this.locale.translate('event.update.success'));
        }),
        catchError((err) => {
          console.error('Error creating event:', err);
          this.sonner.error(this.locale.translate('event.update.error'));
          return of(null);
        })
      );
  }

  // public async updateEvent(id: string, req: EventRequest): Promise<boolean> {
  //   let isSuccess = true;
  //   await firstValueFrom(
  //     this.http.put<Event>(`${environment.apiUrl}/event?id=${id}`, req).pipe(
  //       tap({
  //         next: (event) => {
  //           this.sonner.success(
  //             this.locale.translate('event.update.success')
  //           );
  //           this.store.setEntity('events', event);
  //         },
  //         error: (err) => {
  //           console.error(err);
  //           isSuccess = false;
  //           this.sonner.error(this.locale.translate('event.update.error'));
  //         },
  //       })
  //     )
  //   );
  //   return isSuccess;
  // }

  // public getEventsByRoomId(id: string, start: Date, end: Date) {
  //   const startDate = start.toString();
  //   const endDate = end.toString();
  //   return this.http.get<Event[]>(`${environment.apiUrl}/event/room`, {
  //     params: {
  //       id: id,
  //       start: startDate,
  //       end: endDate,
  //     },
  //   });
  // }

  private createKeys(id: string, range: DateRange): EventKey[] {
    let date = new Date(range.start);
    const keys: EventKey[] = [];
    while (date < range.end) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      keys.push(`${id}/${year}/${month}/${day}`);
      date = this.date.incrementDate(date, 1, 'day');
    }
    return keys;
  }

  private isAlreadyLoaded(id: string, range: DateRange) {
    let date = new Date(range.start);
    while (date < range.end) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const key: EventKey = `${id}/${year}/${month}/${day}`;
      if (!this.store.usersEvents().has(key)) return false;
      date = this.date.incrementDate(date, 1, 'day');
    }
    return true;
  }

  private setEventToStore(
    event: Event<{
      eventCategory?: EventCategory;
      tags?: Tag[];
      workspace?: Workspace;
      room?: Room;
      users?: User[];
      participants?: Participant[];
    }>
  ) {
    let roomId: string | undefined = undefined;
    let tagIds: string[] | undefined = undefined;
    let userIds: string[] | undefined = undefined;
    let participantIds: string[] | undefined = undefined;
    let workspaceId: string | undefined = undefined;
    let eventCategoryId: string | undefined = undefined;
    if (event.tags !== undefined) {
      tagIds = event.tags.map((tag) => tag.id);
      this.store.setEntities('tags', event.tags);
      this.store.setRelation('eventsTags', event.id, tagIds);
    }
    if (event.room !== undefined) {
      roomId = event.room.id;
      this.store.setEntity('rooms', event.room);
    }
    if (event.users !== undefined) {
      userIds = event.users.map((user) => user.id);
      this.store.setEntities('users', event.users);
      this.store.setRelation('eventsUsers', event.id, userIds);
    }
    if (event.participants !== undefined) {
      participantIds = event.participants.map((participant) => participant.id);
      this.store.setEntities('participants', event.participants);
      this.store.setRelation('eventsParticipants', event.id, participantIds);
    }
    if (event.workspace !== undefined) {
      workspaceId = event.workspace.id;
      this.store.setEntity('workspaces', event.workspace);
    }
    if (event.eventCategory !== undefined) {
      eventCategoryId = event.eventCategory.id;
      this.store.setEntity('eventCategories', event.eventCategory);
    }

    this.store.setEntity('events', {
      ...event,
      workspaceId: workspaceId,
      eventCategoryId: eventCategoryId,
      roomId: roomId,
      tagIds: tagIds,
      userIds: userIds,
      participantIds: participantIds,
    });
  }

  private hasEventDetails(id: string) {
    if (!this.store.events().has(id)) return false;
    const event = this.store.events().get(id)!;
    return (
      event.eventCategoryId !== undefined &&
      event.roomId !== undefined &&
      event.tagIds !== undefined &&
      event.workspaceId !== undefined &&
      event.userIds !== undefined &&
      event.participantIds !== undefined
    );
  }

  private setEventsToStore(
    id: string,
    range: DateRange,
    events: Event<{
      eventCategory: EventCategory;
      tags: Tag[];
      workspace: Workspace;
      room: Room;
    }>[]
  ) {
    events.forEach((event) => this.setEventToStore(event));
    let date = new Date(range.start);
    while (date < range.end) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const key: EventKey = `${id}/${year}/${month}/${day}`;
      this.store.setRelation(
        'usersEvents',
        key,
        events
          .filter(
            (e) =>
              !isIsRange(e, {
                start: date,
                end: this.date.incrementDate(date, 1, 'day'),
              })
          )
          .map((e) => e.id)
      );
      date = this.date.incrementDate(date, 1, 'day');
    }
  }

  public getAgendaEvents(range: DateRange): Observable<
    Event<{
      eventCategory: EventCategory;
      tags: Tag[];
      workspace: Workspace;
      room: Room;
    }>[]
  > {
    const id = this.auth.currentUserInfo()?.id ?? '';
    const startDate = range.start.toJSON();
    const endDate = range.end.toJSON();
    if (this.isAlreadyLoaded(id, range)) return of([]);
    return this.http
      .get<
        Event<{
          eventCategory: EventCategory;
          tags: Tag[];
          workspace: Workspace;
          room: Room;
        }>[]
      >(`${environment.apiUrl}/event/user`, {
        params: {
          start: startDate,
          end: endDate,
        },
      })
      .pipe(
        debounceTime(800),
        tap((events) => this.setEventsToStore(id, range, events)),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.locale.translate('event.get.error'));
          return of([]);
        })
      );
  }

  public getDialogEvents(userIds: string[], roomId: string, range: DateRange) {
    const startDate = range.start.toJSON();
    const endDate = range.end.toJSON();
    const jsonUserIds = JSON.stringify(userIds);
    const jsonRoomId = JSON.stringify(roomId);
    return this.http.get<Event[]>(`${environment.apiUrl}/event/user`, {
      params: {
        userIds: jsonUserIds,
        roomId: jsonRoomId,
        start: startDate,
        end: endDate,
      },
    });
  }
}
