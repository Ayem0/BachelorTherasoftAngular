import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
import { TranslateService } from '../../../shared/services/translate/translate.service';
import { format } from '../../../shared/utils/date.utils';
import { EventCategory } from '../../event-category/models/event-category';
import { Tag } from '../../tag/models/tag';
import { DateRange, Event, EventRequest } from '../models/event';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly sonner = inject(SonnerService);
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

  public async createEvent(req: EventRequest): Promise<boolean> {
    let isSuccess = true;
    await firstValueFrom(
      this.http.post<Event<{}>>(`${environment.apiUrl}/event`, req).pipe(
        tap({
          next: (event) => {
            this.store.setEntity('events', event);
            this.sonner.success(
              this.translate.translate('event.create.success'),
              format(event.startDate, 'dddd, MMMM DD, YYYY [at] HH:mm')
            );
          },
          error: (err) => {
            (isSuccess = false), console.error(err);
            this.sonner.error(this.translate.translate('event.create.error'));
          },
        })
      )
    );
    return isSuccess;
  }

  public async updateEvent(id: string, req: EventRequest): Promise<boolean> {
    let isSuccess = true;
    await firstValueFrom(
      this.http.put<Event>(`${environment.apiUrl}/event?id=${id}`, req).pipe(
        tap({
          next: (event) => {
            this.sonner.success(
              this.translate.translate('event.update.success')
            );
            this.store.setEntity('events', event);
          },
          error: (err) => {
            console.error(err);
            isSuccess = false;
            this.sonner.error(this.translate.translate('event.update.error'));
          },
        })
      )
    );
    return isSuccess;
  }

  public getEventsByRoomId(id: string, start: Date, end: Date) {
    const startDate = start.toString();
    const endDate = end.toString();
    return this.http.get<Event[]>(`${environment.apiUrl}/event/room`, {
      params: {
        id: id,
        start: startDate,
        end: endDate,
      },
    });
  }

  public async getEventsByUserId(id: string, range: DateRange) {
    const startDate = range.start.toJSON();
    const endDate = range.end.toJSON();
    await firstValueFrom(
      this.http
        .get<
          Event<{
            eventCategory: EventCategory;
            tags: Tag[];
          }>[]
        >(`${environment.apiUrl}/event/user`, {
          params: {
            id: id,
            start: startDate,
            end: endDate,
          },
        })
        .pipe(
          tap({
            next: (events) => {
              this.store.setEntities('events', events);
              this.store.setEntities(
                'tags',
                events.flatMap((event) => event.tags)
              );
              this.store.setEntities(
                'eventCategories',
                events.map((event) => event.eventCategory)
              );
              this.store.setRelation(
                'usersEvents',
                { id, range },
                events.map((event) => event.id)
              );
            },
            error: (err) => {
              console.error(err);
            },
          })
        )
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
