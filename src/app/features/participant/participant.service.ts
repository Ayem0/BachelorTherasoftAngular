import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Participant, ParticipantRequest } from './participant';

@Injectable({
  providedIn: 'root',
})
export class ParticipantService {
  private readonly http = inject(HttpClient);
  constructor() {}

  public getParticipantByWorkspaceId(workspaceId: string) {
    return this.http.get<Participant[]>(
      `${environment.apiUrl}/api/participant/workspace`,
      { params: { workspaceId } }
    );
  }

  public createParticipant(workspaceId: string, req: ParticipantRequest) {
    return this.http.post<Participant>(
      `${environment.apiUrl}/api/participant`,
      {
        workspaceId,
        firstName: req.firstName,
        lastName: req.lastName,
        participantCategoryId: req.participantCategoryId,
        email: req.email,
        phoneNumber: req.phoneNumber,
        address: req.address,
        city: req.city,
        country: req.country,
        description: req.description,
        dateOfBirth: req.dateOfBirth,
      }
    );
  }

  public updateParticipant(id: string, req: ParticipantRequest) {
    return this.http.put<Participant>(
      `${environment.apiUrl}/api/participant?`,
      {
        firstName: req.firstName,
        lastName: req.lastName,
        participantCategoryId: req.participantCategoryId,
        email: req.email,
        phoneNumber: req.phoneNumber,
        address: req.address,
        city: req.city,
        country: req.country,
        description: req.description,
        dateOfBirth: req.dateOfBirth,
      },
      { params: { id: id } }
    );
  }

  public getParticipantDetailsById(id: string) {
    return this.http.get<Participant>(
      `${environment.apiUrl}/api/participant/details`,
      { params: { id: id } }
    );
  }
}
