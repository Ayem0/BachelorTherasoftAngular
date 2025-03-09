import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import dayjs from 'dayjs';
import { tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { DateRange, Event, EventRequest } from '../models/event';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly sonner = inject(SonnerService);

  public getById(id: string) {
    return this.http.get<Event>(`${environment.apiUrl}/api/event`, {
      params: { id },
    });
  }

  public createEvent(event: EventRequest) {
    return this.http
      .post<Event>(`${environment.apiUrl}/api/event`, {
        roomId: event.roomId,
        startDate: event.startDate,
        endDate: event.endDate,
        participantIds: event.participantIds,
        eventCategoryId: event.eventCategoryId,
        tagIds: event.tagIds,
        userIds: event.userIds,
        description: event.description,
        repetitionInterval: event.repetitionInterval,
        repetitionNumber: event.repetitionNumber,
        repetitionEndDate: event.repetitionEndDate,
      })
      .pipe(
        tap({
          next: () =>
            this.sonner.showToast(
              'Event has been created',
              dayjs(event.startDate).format('dddd, MMMM DD, YYYY [at] HH:mm')
            ),
        })
      );
  }

  public updateEvent(id: string, event: EventRequest) {
    return this.http.put<Event>(
      `${environment.apiUrl}/api/event`,
      {
        roomId: event.roomId,
        startDate: event.startDate,
        endDate: event.endDate,
        eventCategoryId: event.eventCategoryId,
        participantIds: event.participantIds,
        tagIds: event.tagIds,
        userIds: event.userIds,
        description: event.description,
        repetitionInterval: event.repetitionInterval,
        repetitionNumber: event.repetitionNumber,
        repetitionEndDate: event.repetitionEndDate,
      },
      { params: { id: id } }
    );
  }

  public getEventsByRoomId(id: string, start: Date, end: Date) {
    const startDate = start.toString();
    const endDate = end.toString();
    return this.http.get<Event[]>(`${environment.apiUrl}/api/event/room`, {
      params: {
        id: id,
        start: startDate,
        end: endDate,
      },
    });
  }

  public getEventsByUserId(range: DateRange) {
    const startDate = range.start.toJSON();
    const endDate = range.end.toJSON();
    return this.http.get<Event[]>(`${environment.apiUrl}/api/event/user`, {
      params: {
        start: startDate,
        end: endDate,
      },
    });
  }
}
