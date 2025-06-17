import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { catchError, debounceTime, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Id } from '../../../shared/models/entity';
import { LocaleService } from '../../../shared/services/locale/locale.service';
import { SocketService } from '../../../shared/services/socket/socket.service';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store.service';
import { Workspace, WorkspaceRequest } from '../models/workspace';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly sonner = inject(SonnerService);
  private readonly locale = inject(LocaleService);
  private readonly auth = inject(AuthService);
  private readonly socket = inject(SocketService);

  constructor() {
    this.listenForSocketEvents();
  }

  public workspaces(): Signal<Workspace[]> {
    return computed(() => {
      const id = this.auth.currentUserInfo()?.id;
      if (!id || !this.store.usersWorkspaces().has(id)) return [];
      return Array.from(this.store.usersWorkspaces().get(id)!, (id) =>
        this.store.workspaces().get(id)
      ).filter((w) => !!w);
    });
  }

  public workspaceById(
    id: Id | null | undefined
  ): Signal<Workspace | undefined> {
    return computed(() => (id ? this.store.workspaces().get(id) : undefined));
  }

  public getWorkspaces(): Observable<Workspace[]> {
    const id = this.auth.currentUserInfo()?.id;
    if (!id || this.store.usersWorkspaces().has(id)) return of([]);
    return this.http.get<Workspace[]>(`${environment.apiUrl}/workspace`).pipe(
      debounceTime(150),
      tap((workspaces) => this.setWorkspacesToStore(workspaces)),
      catchError((err) => {
        console.error(err);
        this.sonner.error(this.locale.translate('workspace.get.error'));
        return of([]);
      })
    );
  }

  public createWorkspace(req: WorkspaceRequest): Observable<Workspace | null> {
    return this.http
      .post<Workspace>(`${environment.apiUrl}/workspace`, req)
      .pipe(
        debounceTime(150),
        tap((workspace) => {
          this.addWorkspaceToStore(workspace);
          this.sonner.success(
            this.locale.translate('workspace.create.success')
          );
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.locale.translate('workspace.create.error'));
          return of(null);
        })
      );
  }

  public updateWorkspace(
    id: string,
    req: WorkspaceRequest
  ): Observable<Workspace | null> {
    return this.http
      .put<Workspace>(`${environment.apiUrl}/workspace/${id}`, req)
      .pipe(
        debounceTime(150),
        tap((workspace) => {
          this.addWorkspaceToStore(workspace);
          this.sonner.success(
            this.locale.translate('workspace.update.success')
          );
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.locale.translate('workspace.update.error'));
          return of(null);
        })
      );
  }

  public getWorkspaceById(id: string): Observable<Workspace | undefined> {
    if (this.store.workspaces().has(id)) return of(undefined);
    return this.http
      .get<Workspace>(`${environment.apiUrl}/workspace/${id}`)
      .pipe(
        debounceTime(150),
        tap((workspace) => this.addWorkspaceToStore(workspace)),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.locale.translate('workspace.get.error'));
          return of(undefined);
        })
      );
  }

  private listenForSocketEvents() {
    this.socket.onEvent('WorkspaceUpdated', (workspace: Workspace) => {
      console.log('WorkspaceUpdated', workspace);
      this.addWorkspaceToStore(workspace);
    });
    this.socket.onEvent('WorkspaceAdded', (workspace: Workspace) => {
      console.log('WorkspaceAdded', workspace);
      this.addWorkspaceToStore(workspace);
      this.socket
        .invoke('AddToGroupAsync', workspace.id)
        .catch((err) => console.error(err));
    });
    this.socket.onEvent('WorkspaceRemoved', (workspaceId: string) => {
      console.log('WorkspaceRemoved', workspaceId);
      this.removeWorkspaceFromStore(workspaceId);
      this.socket
        .invoke('RemoveFromGroupAsync', workspaceId)
        .catch((err) => console.error(err));
    });
  }

  private setWorkspacesToStore(workspaces: Workspace[]) {
    const userId = this.auth.currentUserInfo()?.id;
    if (!userId) return;
    this.store.setEntities('workspaces', workspaces);
    this.store.setRelation(
      'usersWorkspaces',
      userId,
      workspaces.map((w) => w.id)
    );
  }

  private removeWorkspaceFromStore(workspaceId: string) {
    const userId = this.auth.currentUserInfo()?.id;
    if (!userId) return;
    this.store.deleteEntity('workspaces', workspaceId);
    this.store.deleteFromRelation('usersWorkspaces', userId, workspaceId);
  }

  private addWorkspaceToStore(workspace: Workspace) {
    const userId = this.auth.currentUserInfo()?.id;
    if (!userId) return;
    this.store.setEntity('workspaces', workspace);
    this.store.addToRelation('usersWorkspaces', userId, workspace.id);
  }
}
