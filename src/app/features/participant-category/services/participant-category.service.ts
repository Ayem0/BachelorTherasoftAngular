import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  ParticipantCategory,
  ParticipantCategoryRequest,
} from '../models/participant-category';

@Injectable({
  providedIn: 'root',
})
export class ParticipantCategoryService {
  private readonly http = inject(HttpClient);
  constructor() {}

  public getParticipantCategoryByWorkspaceId(workspaceId: string) {
    return this.http.get<ParticipantCategory[]>(
      `${environment.apiUrl}/api/participantCategory/workspace`,
      { params: { workspaceId } }
    );
  }

  public createParticipantCategory(
    workspaceId: string,
    req: ParticipantCategoryRequest
  ) {
    return this.http.post<ParticipantCategory>(
      `${environment.apiUrl}/api/participantCategory`,
      {
        workspaceId,
        name: req.name,
        color: req.color,
        icon: req.icon,
        description: req.description,
      }
    );
  }

  public updateParticipantCategory(
    id: string,
    req: ParticipantCategoryRequest
  ) {
    return this.http.put<ParticipantCategory>(
      `${environment.apiUrl}/api/ParticipantCategory?`,
      {
        name: req.name,
        color: req.color,
        icon: req.icon,
        description: req.description,
      },
      { params: { id: id } }
    );
  }

  public getParticipantCategoryDetailsById(id: string) {
    return this.http.get<ParticipantCategory>(
      `${environment.apiUrl}/api/ParticipantCategory/details`,
      { params: { id: id } }
    );
  }
}
