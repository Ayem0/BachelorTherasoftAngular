import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Participant } from './participant';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {
  private readonly http = inject(HttpClient);
  constructor() { }

  public getParticipantByWorkspaceId(workspaceId: string) {
    return this.http.get<Participant[]>(`${environment.apiUrl}/api/participant/workspace?workspaceId=${workspaceId}`);
  }

  public createParticipant(
    workspaceId: string,
    firstName: string,
    lastName: string,
    participantCategoryId: string,
    email?: string,
    phoneNumber?: string,
    address?: string,
    city?: string,
    country?: string,
    description?: string,
    dateOfBirth?: Date
  ) {
    return this.http.post<Participant>(`${environment.apiUrl}/api/participant`, 
      { workspaceId, firstName, lastName, participantCategoryId, email, phoneNumber, address, city, country, description, dateOfBirth }
    );
  }

  public updateParticipant(
    id: string,
    firstName: string,
    lastName: string,
    participantCategoryId: string,
    email?: string,
    phoneNumber?: string,
    address?: string,
    city?: string,
    country?: string,
    description?: string,
    dateOfBirth?: Date
  ) {
    return this.http.put<Participant>(`${environment.apiUrl}/api/participant?`, 
      { id, firstName, lastName, participantCategoryId, email, phoneNumber, address, city, country, description, dateOfBirth }, { params: { id: id } })
  }

  public getParticipantDetailsById(id: string) {
    return this.http.get<Participant>(`${environment.apiUrl}/api/participant/details`, { params: { id: id } });
  }
}
