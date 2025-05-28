import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { catchError, debounceTime, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UNKNOW_USER, User } from '../../../core/auth/models/auth';
import { SocketService } from '../../../shared/services/socket/socket.service';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
import { TranslateService } from '../../../shared/services/translate/translate.service';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly sonner = inject(SonnerService);
  private readonly translate = inject(TranslateService);
  private readonly socket = inject(SocketService);

  constructor() {
    this.listenForSocketEvents();
  }

  public membersByWorkspaceId(id: Signal<string>): Signal<User[]> {
    return computed(() => {
      if (!this.store.workspacesUsers().has(id())) return [];
      return Array.from(
        this.store.workspacesUsers().get(id())!,
        (i) => this.store.users().get(i) ?? UNKNOW_USER
      );
    });
  }

  public getMembersByWorkspaceId(id: string): Observable<User[]> {
    if (this.store.workspacesUsers().has(id)) return of([]);
    return this.http
      .get<User[]>(`${environment.apiUrl}/workspace/${id}/users`)
      .pipe(
        debounceTime(150),
        tap((users) => this.addMembersToStore(id, users)),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.translate.translate('members.get.error'));
          return of([]);
        })
      );
  }

  private listenForSocketEvents() {
    this.socket.onEvent<{ workspaceId: string; user: User }>(
      'WorkspaceUserAdded',
      ({ workspaceId, user }) => {
        console.log('WorkspaceUserAdded', { workspaceId, user });
        this.addMemberToStore(workspaceId, user);
      }
    );
    this.socket.onEvent<{ workspaceId: string; userId: string }>(
      'UserRemoved',
      ({ workspaceId, userId }) => {
        console.log('UserRemoved', { workspaceId, userId });
        this.removeMemberFromStore(workspaceId, userId);
      }
    );
  }

  private addMemberToStore(workspaceId: string, member: User) {
    this.store.setEntities('users', [member]);
    this.store.addToRelation('workspacesUsers', workspaceId, member.id);
  }

  private removeMemberFromStore(workspaceId: string, userId: string) {
    this.store.deleteFromRelation('workspacesUsers', workspaceId, userId);
  }

  private addMembersToStore(workspaceId: string, users: User[]) {
    this.store.setEntities('users', users);
    this.store.setRelation(
      'workspacesUsers',
      workspaceId,
      users.map((m) => m.id)
    );
  }
}
