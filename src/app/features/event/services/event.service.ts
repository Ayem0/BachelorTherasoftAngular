import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Interval } from '../../../shared/models/interval';
import { Event } from '../models/event';

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

  public createEvent(
    roomId: string,
    startDate: Date,
    endDate: Date,
    eventCategoryId: string,
    participantIds: string[],
    tagIds: string[],
    userIds: string[],
    description?: string,
    repetitionInterval?: Interval,
    repetitionNumber?: number,
    repetitionEndDate?: Date
  ) {
    return this.http.post<Event>(`${environment.apiUrl}/api/event`, {
      roomId: roomId,
      startDate: startDate,
      endDate: endDate,
      participantIds: participantIds,
      eventCategoryId: eventCategoryId,
      tagIds: tagIds,
      userIds: userIds,
      description: description,
      repetitionInterval: repetitionInterval,
      repetitionNumber: repetitionNumber,
      repetitionEndDate: repetitionEndDate,
    });
  }

  public updateEvent(
    id: string,
    roomId: string,
    startDate: Date,
    endDate: Date,
    eventCategoryId: string,
    participantIds: string[],
    tagIds: string[],
    userIds: string[],
    description?: string,
    repetitionInterval?: Interval,
    repetitionNumber?: number,
    repetitionEndDate?: Date
  ) {
    return this.http.put<Event>(
      `${environment.apiUrl}/api/event`,
      {
        id: id,
        roomId: roomId,
        startDate: startDate,
        endDate: endDate,
        eventCategoryId: eventCategoryId,
        participantIds: participantIds,
        tagIds: tagIds,
        userIds: userIds,
        description: description,
        repetitionInterval: repetitionInterval,
        repetitionNumber: repetitionNumber,
        repetitionEndDate: repetitionEndDate,
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
