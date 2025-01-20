import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { EventCategory } from './event-category';

@Injectable({
  providedIn: 'root'
})
export class EventCategoryService {
  private readonly http = inject(HttpClient);
  constructor() { }

  public getEventCategoryByWorkspaceId(workspaceId: string) {
    return this.http.get<EventCategory[]>(`${environment.apiUrl}/api/EventCategory/workspace`, { params: { workspaceId }});
  }

  public createEventCategory(
    workspaceId: string,
    name: string,
    color: string,
    icon: string,
    description?: string,
  ) {
    return this.http.post<EventCategory>(`${environment.apiUrl}/api/EventCategory`, 
      { workspaceId, name, color, icon, description }
    );
  }

  public updateEventCategory(
    id: string,
    name: string,
    color: string,
    icon: string,
    description?: string,
  ) {
    return this.http.put<EventCategory>(`${environment.apiUrl}/api/EventCategory?`, 
      { id, name, color, icon, description }, { params: { id: id } })
  }

  public getEventCategoryDetailsById(id: string) {
    return this.http.get<EventCategory>(`${environment.apiUrl}/api/EventCategory/details`, { params: { id: id } });
  }
}
