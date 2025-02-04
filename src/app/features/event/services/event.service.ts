import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Event, EventRequest } from '../models/event';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly http = inject(HttpClient);

  public getById(id: string) {
    return this.http.get<Event>(`${environment.apiUrl}/api/event`, {
      params: { id },
    });
  }

  public createEvent(event: EventRequest) {
    return this.http.post<Event>(`${environment.apiUrl}/api/event`, {
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
    });
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

  public getEventsByUser(start: Date, end: Date) {
    const startDate = start.toJSON();
    const endDate = end.toJSON();
    return this.http.get<Event[]>(`${environment.apiUrl}/api/event/user`, {
      params: {
        start: startDate,
        end: endDate,
      },
    });
  }
}
