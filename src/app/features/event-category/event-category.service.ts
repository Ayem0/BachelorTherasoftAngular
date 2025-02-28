import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { EventCategory, EventCategoryRequest } from './event-category';

@Injectable({
  providedIn: 'root',
})
export class EventCategoryService {
  private readonly http = inject(HttpClient);
  constructor() {}

  public getEventCategoryByWorkspaceId(workspaceId: string) {
    return this.http.get<EventCategory[]>(
      `${environment.apiUrl}/api/EventCategory/workspace`,
      { params: { workspaceId } }
    );
  }

  public createEventCategory(workspaceId: string, req: EventCategoryRequest) {
    return this.http.post<EventCategory>(
      `${environment.apiUrl}/api/EventCategory`,
      {
        workspaceId,
        name: req.name,
        color: req.color,
        icon: req.icon,
        description: req.description,
      }
    );
  }

  public updateEventCategory(id: string, req: EventCategoryRequest) {
    return this.http.put<EventCategory>(
      `${environment.apiUrl}/api/EventCategory?`,
      {
        name: req.name,
        color: req.color,
        icon: req.icon,
        description: req.description,
      },
      { params: { id: id } }
    );
  }

  public getEventCategoryDetailsById(id: string) {
    return this.http.get<EventCategory>(
      `${environment.apiUrl}/api/EventCategory/details`,
      { params: { id: id } }
    );
  }
}
