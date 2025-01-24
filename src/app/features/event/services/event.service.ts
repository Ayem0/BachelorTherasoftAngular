import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Interval } from '../../../shared/models/interval';
import { Month } from '../../../shared/models/month';
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

  public getEventsByRoomId(
    id: string,
    month: number,
    year: number,
    day?: number,
    week?: number
  ) {
    return this.http.get<Event[]>(`${environment.apiUrl}/api/event/room`, {
      params: {
        id: id,
        day: day || 0,
        week: week || 0,
        month: month,
        year: year,
      },
    });
  }

  public getAgenda(month: Month, year: number, day?: number, week?: number) {
    return this.http.get<Event[]>(`${environment.apiUrl}/api/event/agenda`, {
      params: {
        day: day || 0,
        week: week || 0,
        month: month,
        year: year,
      },
    });
  }
}
