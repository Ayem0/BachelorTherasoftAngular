import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import {
  catchError,
  debounceTime,
  filter,
  firstValueFrom,
  map,
  of,
  tap,
} from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UNKNOW_USER, User } from '../../../core/auth/models/auth';
import { AuthService } from '../../../core/auth/services/auth.service';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
import { TranslateService } from '../../../shared/services/translate/translate.service';
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
  private readonly translate = inject(TranslateService);
  private readonly auth = inject(AuthService);

  public invitationsReceived(): Signal<Invitation[]> {
    const id = this.auth.currentUserInfo()?.id;
    return computed(() => {
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
    const id = this.auth.currentUserInfo()?.id;
    return computed(() => {
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

  public async getReceivedInvitationsByUser(): Promise<void> {
    const id = this.auth.currentUserInfo()?.id;
    if (!id || this.store.usersReceivedInvitations().has(id)) {
      return;
    }
    await firstValueFrom(
      this.http.get<Invitation[]>(`${environment.apiUrl}/api/invitation`).pipe(
        tap({
          next: (invitations) => {
            this.store.setEntities('invitations', invitations);
            this.store.setRelation(
              'usersReceivedInvitations',
              id,
              invitations.map((i) => i.id)
            );
          },
          error: (error) => {
            console.error(error);
            this.sonner.error(this.translate.translate('invitation.get.error'));
          },
        })
      )
    );
  }

  public async getSentInvitations(): Promise<void> {
    const id = this.auth.currentUserInfo()?.id;
    if (!id || this.store.usersSentInvitations().has(id)) {
      return;
    }
    await firstValueFrom(
      this.http
        .get<ContactInvitation<{ receiver: User }>[]>(
          `${environment.apiUrl}/api/invitation/contact/send`
        )
        .pipe(
          tap({
            next: (invitations) => {
              this.store.setEntities('invitations', invitations);
              this.store.setEntities(
                'users',
                invitations.map((i) => i.receiver)
              );
              this.store.setRelation(
                'usersSentInvitations',
                id,
                invitations.map((i) => i.id)
              );
            },
            error: (error) => {
              console.error(error);
              this.sonner.error(
                this.translate.translate('invitation.get.error')
              );
            },
          })
        )
    );
  }

  public async createWorkspaceInvitation(
    workspaceId: string,
    receiverId: string
  ) {
    let isSuccess = true;
    await firstValueFrom(
      this.http
        .post<Invitation>(
          `${environment.apiUrl}/api/invitation/workspace/create`,
          {
            workspaceId: workspaceId,
            receiverUserId: receiverId,
          }
        )
        .pipe(
          tap({
            next: (invitation) => {
              this.store.setEntity('invitations', invitation);
              this.sonner.success(
                this.translate.translate('invitation.workspace.create.success')
              );
            },
            error: (error) => {
              isSuccess = false;
              console.error(error);
              this.sonner.error(
                this.translate.translate('invitation.workspace.create.error')
              );
            },
          })
        )
    );
    return isSuccess;
  }

  public createContactInvitation(email: string) {
    return this.http
      .post<ContactInvitation<{ receiver: User }>>(
        `${environment.apiUrl}/api/invitation/contact/create`,
        {
          contactEmail: email,
        }
      )
      .pipe(
        debounceTime(200),
        map((invitation) => {
          this.store.setEntity('invitations', invitation);
          this.store.setEntity('users', invitation.receiver);
          this.store.addToRelation(
            'usersSentInvitations',
            this.auth.currentUserInfo()!.id,
            invitation.id
          );
          this.sonner.success(
            this.translate.translate('invitation.contact.create.success')
          );
          return true;
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.translate.translate('invitation.contact.create.error')
          );
          return of(false);
        })
      );
  }

  public acceptWorkspaceInvitation(id: string) {
    return this.http
      .post(`${environment.apiUrl}/api/invitation/workspace/${id}/accept`, {})
      .pipe(
        debounceTime(150),
        tap(() => {
          const invitation = this.store.invitations().get(id);
          if (
            invitation &&
            invitation.invitationType === InvitationType.Workspace
          ) {
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
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.translate.translate('invitation.workspace.accept.error')
          );
          return of(false);
        })
      );
  }

  public cancelWorkspaceInvitation(id: string) {
    return this.http
      .post(`${environment.apiUrl}/api/invitation/workspace/${id}/cancel`, {})
      .pipe(
        debounceTime(150),
        tap(() => {
          const invitation = this.store.invitations().get(id);
          if (
            invitation &&
            invitation.invitationType === InvitationType.Workspace
          ) {
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
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.translate.translate('invitation.workspace.accept.error')
          );
          return of();
        })
      );
  }

  public refuseWorkspaceInvitation(id: string) {
    return this.http
      .post(`${environment.apiUrl}/api/invitation/workspace/${id}/refuse`, {})
      .pipe(
        debounceTime(150),
        tap(() => {
          const invitation = this.store.invitations().get(id);
          if (
            invitation &&
            invitation.invitationType === InvitationType.Workspace
          ) {
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
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.translate.translate('invitation.workspace.accept.error')
          );
          return of();
        })
      );
  }

  public acceptContactInvitation(id: string) {
    return this.http
      .post(`${environment.apiUrl}/api/invitation/contact/${id}/accept`, {})
      .pipe(
        debounceTime(150),
        tap(() => {
          this.store.deleteEntity('invitations', id);
          this.store.deleteFromRelation(
            'usersReceivedInvitations',
            this.auth.currentUserInfo()!.id,
            id
          );
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.translate.translate('invitation.contact.accept.error')
          );
          return of();
        })
      );
  }

  public cancelContactInvitation(id: string) {
    return this.http
      .post(`${environment.apiUrl}/api/invitation/contact/${id}/cancel`, {})
      .pipe(
        debounceTime(150),
        tap(() => {
          this.store.deleteEntity('invitations', id);
          this.store.deleteFromRelation(
            'usersSentInvitations',
            this.auth.currentUserInfo()!.id,
            id
          );
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.translate.translate('invitation.contact.cancel.error')
          );
          return of();
        })
      );
  }

  public refuseContactInvitation(id: string) {
    return this.http
      .post(`${environment.apiUrl}/api/invitation/contact/${id}/refuse`, {})
      .pipe(
        debounceTime(150),
        tap(() => {
          this.store.deleteEntity('invitations', id);
          this.store.deleteFromRelation(
            'usersReceivedInvitations',
            this.auth.currentUserInfo()!.id,
            id
          );
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.translate.translate('invitation.contact.refuse.error')
          );
          return of();
        })
      );
  }

  public getInvitationsByWorkspaceId(id: string) {
    return this.http
      .get<Invitation[]>(
        `${environment.apiUrl}/api/invitation/workspace/${id}/send`
      )
      .pipe(
        filter(() => !this.store.workspacesInvitations().has(id)),
        debounceTime(150),
        tap((invitations) => {
          this.store.setEntities('invitations', invitations);
          this.store.setRelation(
            'workspacesInvitations',
            id,
            invitations.map((i) => i.id)
          );
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.translate.translate('invitation.contact.accept.error')
          );
          return of();
        })
      );
  }
}
