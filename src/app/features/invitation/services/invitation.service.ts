import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Invitation } from '../models/invitation.model';

@Injectable({
  providedIn: 'root',
})
export class InvitationService {
  private readonly http = inject(HttpClient);

  public getReceivedInvitationsByUser() {
    return this.http.get<Invitation[]>(`${environment.apiUrl}/api/invitation`);
  }

  public createWorkspaceInvitation(workspaceId: string, receiverId: string) {
    return this.http.post<Invitation>(
      `${environment.apiUrl}/api/invitation/workspace/create`,
      {
        workspaceId: workspaceId,
        receiverUserId: receiverId,
      }
    );
  }

  public acceptWorkspaceInvitation(id: string) {
    return this.http.post(
      `${environment.apiUrl}/api/invitation/workspace/${id}/accept`,
      {}
    );
  }

  public cancelWorkspaceInvitation(id: string) {
    return this.http.post(
      `${environment.apiUrl}/api/invitation/workspace/${id}/cancel`,
      {}
    );
  }

  public refuseWorkspaceInvitation(id: string) {
    return this.http.post(
      `${environment.apiUrl}/api/invitation/workspace/${id}/refuse`,
      {}
    );
  }

  public createContactInvitation(contactEmail: string) {
    return this.http.post<Invitation>(
      `${environment.apiUrl}/api/invitation/contact/create`,
      {
        contactEmail: contactEmail,
      }
    );
  }

  public acceptContactInvitation(id: string) {
    return this.http.post(
      `${environment.apiUrl}/api/invitation/contact/${id}/accept`,
      {}
    );
  }

  public cancelContactInvitation(id: string) {
    return this.http.post(
      `${environment.apiUrl}/api/invitation/contact/${id}/cancel`,
      {}
    );
  }

  public refuseContactInvitation(id: string) {
    return this.http.post(
      `${environment.apiUrl}/api/invitation/contact/${id}/refuse`,
      {}
    );
  }

  public getInvitationsByWorkspaceId(id: string) {
    return this.http.get<Invitation[]>(
      `${environment.apiUrl}/api/invitation/workspace/${id}/send`
    );
  }

  public getPendingInvitationsByUser() {
    return this.http.get<Invitation[]>(
      `${environment.apiUrl}/api/invitation/contact/send`
    );
  }
}
