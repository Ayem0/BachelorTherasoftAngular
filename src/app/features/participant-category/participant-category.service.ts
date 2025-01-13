import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ParticipantCategory } from './participant-category';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ParticipantCategoryService {
  private readonly http = inject(HttpClient);
  constructor() { }

  public getParticipantCategoryByWorkspaceId(workspaceId: string) {
    return this.http.get<ParticipantCategory[]>(`${environment.apiUrl}/api/participantCategory/workspace?workspaceId=${workspaceId}`);
  }

  public createParticipantCategory(
    workspaceId: string,
    name: string,
    color: string,
    icon: string,
    description?: string,
  ) {
    return this.http.post<ParticipantCategory>(`${environment.apiUrl}/api/participantCategory`, 
      { workspaceId, name, color, icon, description }
    );
  }

  public updateParticipantCategory(
    id: string,
    name: string,
    color: string,
    icon: string,
    description?: string,
  ) {
    return this.http.put<ParticipantCategory>(`${environment.apiUrl}/api/ParticipantCategory?`, 
      { id, name, color, icon, description }, { params: { id: id } })
  }

  public getParticipantCategoryDetailsById(id: string) {
    return this.http.get<ParticipantCategory>(`${environment.apiUrl}/api/ParticipantCategory/details`, { params: { id: id } });
  }
}
