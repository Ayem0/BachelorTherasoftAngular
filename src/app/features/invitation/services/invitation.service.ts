import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { catchError, debounceTime, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UNKNOW_USER, User } from '../../../core/auth/models/auth';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Id } from '../../../shared/models/entity';
import { LocaleService } from '../../../shared/services/locale/locale.service';
import { SocketService } from '../../../shared/services/socket/socket.service';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store.service';
import { Workspace } from '../../workspace/models/workspace';
import {
  ContactInvitation,
  Invitation,
  InvitationType,
  UNKNOW_INVITATION,
  WorkspaceInvitation,
} from '../models/invitation.model';

@Injectable({
  providedIn: 'root',
})
export class InvitationService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly sonner = inject(SonnerService);
  private readonly locale = inject(LocaleService);
  private readonly auth = inject(AuthService);
  private readonly socket = inject(SocketService);

  constructor() {
    this.handleSocketEvents();
  }

  public invitationsReceived(): Signal<Invitation[]> {
    return computed(() => {
      const id = this.auth.currentUserInfo()?.id;
      if (!id || !this.store.usersReceivedInvitations().has(id)) return [];
      return Array.from(
        this.store.usersReceivedInvitations().get(id)!,
        (i) => this.store.invitations().get(i) ?? UNKNOW_INVITATION
      );
    });
  }

  public contactInvitationsSent(): Signal<
    ContactInvitation<{ receiver: User }>[]
  > {
    return computed(() => {
      const id = this.auth.currentUserInfo()?.id;
      if (!id || !this.store.usersSentInvitations().has(id)) return [];
      const ids = this.store.usersSentInvitations().get(id)!;
      return Array.from(ids, (i) => {
        const invitation = this.store.invitations().get(i) ?? UNKNOW_INVITATION;
        const receiver =
          this.store.users().get(invitation.receiverId) ?? UNKNOW_USER;
        return {
          ...invitation,
          receiver,
        } as ContactInvitation<{ receiver: User }>;
      });
    });
  }

  public workspaceInvitations(id: Id): Signal<
    WorkspaceInvitation<{
      receiver: User;
      sender: User;
    }>[]
  > {
    return computed(() => {
      if (!this.store.workspacesInvitations().has(id)) return [];
      const ids = this.store.workspacesInvitations().get(id)!;
      return Array.from(ids, (i) => {
        const invitation = this.store.invitations().get(i) ?? UNKNOW_INVITATION;
        const receiver =
          this.store.users().get(invitation.receiverId) ?? UNKNOW_USER;
        const sender =
          this.store.users().get(invitation.senderId) ?? UNKNOW_USER;
        return {
          ...invitation,
          receiver,
          sender,
        } as WorkspaceInvitation<{
          receiver: User;
          sender: User;
        }>;
      });
    });
  }

  public getReceivedInvitations(): Observable<Invitation[]> {
    const id = this.auth.currentUserInfo()?.id;
    if (!id || this.store.usersReceivedInvitations().has(id)) return of([]);
    return this.http
      .get<
        | ContactInvitation<{ sender: User }>[]
        | WorkspaceInvitation<{ workspace: Workspace; sender: User }>[]
      >(`${environment.apiUrl}/invitation`)
      .pipe(
        debounceTime(150),
        tap((invitations) =>
          this.setReceivedInvitationsToStore(id, invitations)
        ),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.locale.translate('invitation.received.get.error')
          );
          return of([]);
        })
      );
  }

  public getSentInvitations(): Observable<
    ContactInvitation<{
      receiver: User;
    }>[]
  > {
    const id = this.auth.currentUserInfo()?.id;
    if (!id || this.store.usersSentInvitations().has(id)) return of([]);
    return this.http
      .get<ContactInvitation<{ receiver: User }>[]>(
        `${environment.apiUrl}/invitation/contact/send`
      )
      .pipe(
        debounceTime(150),
        tap((invitations) => this.setSentInvitationsToStore(id, invitations)),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.locale.translate('invitation.sent.get.error'));
          return of([]);
        })
      );
  }

  public createWorkspaceInvitation(
    workspaceId: Id,
    receiverId: Id
  ): Observable<Boolean> {
    return this.http
      .post<
        WorkspaceInvitation<{
          receiver: User;
          sender: User;
        }>
      >(`${environment.apiUrl}/invitation/workspace/create`, {
        workspaceId: workspaceId,
        receiverUserId: receiverId,
      })
      .pipe(
        debounceTime(150),
        tap((invitation) => {
          this.addWorkspaceInvitationToStore(invitation);
          this.sonner.success(
            this.locale.translate('invitation.workspace.create.success')
          );
        }),
        map(() => true),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.locale.translate('invitation.workspace.create.error')
          );
          return of(false);
        })
      );
  }

  public acceptWorkspaceInvitation(id: Id): Observable<boolean> {
    return this.http
      .post(`${environment.apiUrl}/invitation/workspace/${id}/accept`, {})
      .pipe(
        debounceTime(150),
        tap(() => this.removeWorkspaceInvitationFromStore(id)),
        map(() => true),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.locale.translate('invitation.workspace.accept.error')
          );
          return of(false);
        })
      );
  }

  public cancelWorkspaceInvitation(id: Id) {
    return this.http
      .post(`${environment.apiUrl}/invitation/workspace/${id}/cancel`, {})
      .pipe(
        debounceTime(150),
        tap(() => this.removeWorkspaceInvitationFromStore(id)),
        map(() => true),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.locale.translate('invitation.workspace.cancel.error')
          );
          return of();
        })
      );
  }

  public refuseWorkspaceInvitation(id: Id) {
    return this.http
      .post(`${environment.apiUrl}/invitation/workspace/${id}/refuse`, {})
      .pipe(
        debounceTime(150),
        tap(() => this.removeWorkspaceInvitationFromStore(id)),
        map(() => true),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.locale.translate('invitation.workspace.refuse.error')
          );
          return of();
        })
      );
  }

  public getInvitationsByWorkspaceId(id: Id): Observable<
    WorkspaceInvitation<{
      receiver: User;
      sender: User;
    }>[]
  > {
    if (this.store.workspacesInvitations().has(id)) return of([]);
    return this.http
      .get<
        WorkspaceInvitation<{
          receiver: User;
          sender: User;
        }>[]
      >(`${environment.apiUrl}/invitation/workspace/${id}/send`)
      .pipe(
        debounceTime(150),
        tap((invitations) =>
          this.setWorkspaceInvitationsToStore(id, invitations)
        ),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.locale.translate('invitation.workspace.get.error')
          );
          return of([]);
        })
      );
  }

  // Contact
  public createContactInvitation(email: string): Observable<boolean> {
    return this.http
      .post<ContactInvitation<{ receiver: User; sender: User }>>(
        `${environment.apiUrl}/invitation/contact/create`,
        {
          contactEmail: email,
        }
      )
      .pipe(
        debounceTime(150),
        tap((invitation) => {
          this.addContactInvitationToStore(invitation);
          this.sonner.success(
            this.locale.translate('invitation.contact.create.success')
          );
        }),
        map(() => true),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.locale.translate('invitation.contact.create.error')
          );
          return of(false);
        })
      );
  }

  public acceptContactInvitation(id: Id): Observable<boolean> {
    return this.http
      .post(`${environment.apiUrl}/invitation/contact/${id}/accept`, {})
      .pipe(
        debounceTime(150),
        tap(() => this.removeContactInvitationFromStore(id)),
        map(() => true),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.locale.translate('invitation.contact.accept.error')
          );
          return of();
        })
      );
  }

  public cancelContactInvitation(id: Id): Observable<boolean> {
    return this.http
      .post(`${environment.apiUrl}/invitation/contact/${id}/cancel`, {})
      .pipe(
        debounceTime(150),
        tap(() => this.removeContactInvitationFromStore(id)),
        map(() => true),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.locale.translate('invitation.contact.cancel.error')
          );
          return of();
        })
      );
  }

  public refuseContactInvitation(id: Id): Observable<boolean> {
    return this.http
      .post(`${environment.apiUrl}/invitation/contact/${id}/refuse`, {})
      .pipe(
        debounceTime(150),
        tap(() => this.removeContactInvitationFromStore(id)),
        map(() => true),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.locale.translate('invitation.contact.refuse.error')
          );
          return of();
        })
      );
  }

  private handleSocketEvents() {
    // Contact
    this.socket.onEvent<ContactInvitation<{ receiver: User; sender: User }>>(
      'ContactInvitationCreated',
      (invitation) => {
        console.log('ContactInvitationCreated:', invitation);
        this.addContactInvitationToStore(invitation);
      }
    );
    this.socket.onEvent<Id>('ContactInvitationDeleted', (id) => {
      console.log('ContactInvitationDeleted:', id);
      this.removeContactInvitationFromStore(id);
    });
    // Workspace
    this.socket.onEvent<
      WorkspaceInvitation<{
        receiver: User;
        sender: User;
        workspace: Workspace;
      }>
    >('WorkspaceInvitationCreated', (invitation) => {
      console.log('WorkspaceInvitationCreated:', invitation);
      this.addWorkspaceInvitationToStore(invitation);
    });
    this.socket.onEvent<Id>('WorkspaceInvitationDeleted', (id) => {
      console.log('WorkspaceInvitationDeleted:', id);
      this.removeWorkspaceInvitationFromStore(id);
    });
  }

  private setSentInvitationsToStore(
    userId: Id,
    invitations: ContactInvitation<{ receiver: User }>[]
  ) {
    this.store.setEntities('invitations', invitations);
    this.store.setEntities(
      'users',
      invitations.map((i) => i.receiver)
    );
    this.store.setRelation(
      'usersSentInvitations',
      userId,
      invitations.map((i) => i.id)
    );
  }

  private setReceivedInvitationsToStore(
    userId: Id,
    invitations:
      | ContactInvitation<{ sender: User }>[]
      | WorkspaceInvitation<{ workspace: Workspace; sender: User }>[]
  ) {
    console.log(invitations);
    if (invitations.length > 0) {
      const workspaceInv = invitations.filter(
        (i) => i.invitationType === InvitationType.Workspace
      );
      this.store.setEntities(
        'workspaces',
        workspaceInv.map((i) => i.workspace)
      );
    }
    this.store.setEntities('invitations', invitations);
    this.store.setEntities(
      'users',
      invitations.map((i) => i.sender)
    );
    this.store.setRelation(
      'usersReceivedInvitations',
      userId,
      invitations.map((i) => i.id)
    );
  }

  private addContactInvitationToStore(
    invitation: ContactInvitation<{ receiver: User; sender: User }>
  ) {
    this.store.setEntity('invitations', invitation);
    this.store.setEntity('users', invitation.receiver);
    this.store.setEntity('users', invitation.sender);
    this.store.addToRelation(
      'usersReceivedInvitations',
      invitation.receiver.id,
      invitation.id
    );
    this.store.addToRelation(
      'usersSentInvitations',
      invitation.sender.id,
      invitation.id
    );
  }

  private removeContactInvitationFromStore(id: Id) {
    const invitation = this.store.invitations().get(id);
    if (invitation) {
      this.store.deleteEntity('invitations', id);
      this.store.deleteFromRelation(
        'usersSentInvitations',
        invitation.senderId,
        id
      );
      this.store.deleteFromRelation(
        'usersReceivedInvitations',
        invitation.receiverId,
        id
      );
    }
  }

  private addWorkspaceInvitationToStore(
    invitation: WorkspaceInvitation<{
      receiver: User;
      sender: User;
      workspace?: Workspace;
    }>
  ) {
    if (invitation.workspace) {
      this.store.setEntity('workspaces', invitation.workspace);
    }
    this.store.setEntity('invitations', invitation);
    this.store.setEntity('users', invitation.receiver);
    this.store.setEntity('users', invitation.sender);
    this.store.addToRelation(
      'usersReceivedInvitations',
      invitation.receiver.id,
      invitation.id
    );
    this.store.addToRelation(
      'workspacesInvitations',
      invitation.workspaceId,
      invitation.id
    );
  }

  private setWorkspaceInvitationsToStore(
    workspaceId: Id,
    invitations: WorkspaceInvitation<{
      receiver: User;
      sender: User;
      workspace?: Workspace;
    }>[]
  ) {
    this.store.setEntities('invitations', invitations);
    this.store.setEntities(
      'users',
      invitations.map((i) => i.receiver)
    );
    this.store.setEntities(
      'users',
      invitations.map((i) => i.sender)
    );
    this.store.setRelation(
      'workspacesInvitations',
      workspaceId,
      invitations.map((i) => i.id)
    );
  }

  private removeWorkspaceInvitationFromStore(id: Id) {
    const invitation = this.store.invitations().get(id);
    if (invitation && invitation.invitationType === InvitationType.Workspace) {
      this.store.deleteEntity('invitations', id);
      this.store.deleteFromRelation(
        'workspacesInvitations',
        (invitation as WorkspaceInvitation).workspaceId,
        id
      );
      this.store.deleteFromRelation(
        'usersReceivedInvitations',
        invitation.receiverId,
        id
      );
    }
  }
}
