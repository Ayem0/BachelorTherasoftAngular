import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, debounceTime, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/services/auth.service';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
import { TranslateService } from '../../../shared/services/translate/translate.service';
import { format, incrementDate } from '../../../shared/utils/date.utils';
import { EventCategory } from '../../event-category/models/event-category';
import { Room } from '../../room/models/room';
import { Tag } from '../../tag/models/tag';
import { Workspace } from '../../workspace/models/workspace';
import { DateRange, Event, EventKey, EventRequest } from '../models/event';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly sonner = inject(SonnerService);
  private readonly auth = inject(AuthService);
  private readonly store = inject(Store);
  private readonly translate = inject(TranslateService);

  // public getUserEventsByRange(
  //   dateRange: DateRange,
  //   userId: string
  // ): Signal<
  //   Event<{
  //     eventCategory: EventCategory;
  //     members: Member[];
  //     participants: Participant[];
  //     room: Room;
  //     tags: Tag[];
  //     workspace: Workspace;
  //   }>[]
  // > {
  //   return computed(() =>
  //     this.eventStore
  //       .eventsArr()
  //       .filter(
  //         (event) =>
  //           isIsRange(event, dateRange) && event.memberIds.includes(userId)
  //       )
  //       .map((event) => ({
  //         ...event,
  //         eventCategory:
  //           this.eventCategoryStore
  //             .eventCategories()
  //             .get(event.eventCategoryId) ?? UNKNOWN_EVENT_CATEGORY,
  //         members: event.memberIds.map(
  //           (id) => this.memberStore.members().get(id) ?? UNKNOW_MEMBER
  //         ),
  //         participants: event.participantIds.map(
  //           (id) =>
  //             this.participantStore.participants().get(id) ??
  //             UNKNOWN_PARTICIPANT
  //         ),
  //         room: this.roomStore.rooms().get(event.roomId) ?? UNKNOW_ROOM,
  //         tags: event.tagIds.map(
  //           (id) => this.tagStore.tags().get(id) ?? UNKNOWN_TAG
  //         ),
  //         workspace:
  //           this.workspaceStore.workspaces().get(event.workspaceId) ??
  //           UNKNOW_WORKSPACE,
  //       }))
  //   );
  // }

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

  public isSideBarOpen = signal(false);

  public getById(id: string) {
    return this.http.get<Event>(`${environment.apiUrl}/event`, {
      params: { id },
    });
  }

  public createEvent(req: EventRequest): Observable<boolean> {
    const id = this.auth.currentUserInfo()?.id ?? '';
    return this.http.post<Event<{}>>(`${environment.apiUrl}/event`, req).pipe(
      debounceTime(150),
      map((event) => {
        this.store.setEntity('events', event);
        const keys = this.createKeys(id, {
          start: req.startDate,
          end: req.endDate,
        });
        keys.forEach((key) =>
          this.store.addToRelation('usersEvents', key, event.id)
        );
        this.sonner.success(
          this.translate.translate('event.create.success'),
          format(event.startDate, 'dddd, MMMM DD, YYYY [at] HH:mm')
        );
        return true;
      }),
      catchError((err) => {
        console.error('Error creating event:', err);
        this.sonner.error(this.translate.translate('event.create.error'));
        return of(false);
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
  //             this.translate.translate('event.update.success')
  //           );
  //           this.store.setEntity('events', event);
  //         },
  //         error: (err) => {
  //           console.error(err);
  //           isSuccess = false;
  //           this.sonner.error(this.translate.translate('event.update.error'));
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
    const date = new Date(range.start);
    const keys: EventKey[] = [];
    while (date < range.end) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      keys.push(`${id}/${year}/${month}/${day}`);
    }
    return keys;
  }

  private isAlreadyLoaded(id: string, range: DateRange) {
    const date = new Date(range.start);
    while (date < range.end) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const key: EventKey = `${id}/${year}/${month}/${day}`;
      if (!this.store.usersEvents().has(key)) return false;
      incrementDate(date, 1, 'day');
    }
    return true;
  }

  public getEventsByUserId(id: string, range: DateRange) {
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
        debounceTime(150),
        tap((events) => {
          this.store.setEntities('events', events);
          this.store.setEntities(
            'tags',
            events.flatMap((event) => event.tags)
          );
          this.store.setEntities(
            'eventCategories',
            events.map((event) => event.eventCategory)
          );
          const keys = this.createKeys(id, range);
          keys.forEach((key) =>
            this.store.setRelation(
              'usersEvents',
              key,
              events.map((event) => event.id)
            )
          );
        }),
        catchError((err) => {
          console.error('Error creating event:', err);
          this.sonner.error(this.translate.translate('event.create.error'));
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
