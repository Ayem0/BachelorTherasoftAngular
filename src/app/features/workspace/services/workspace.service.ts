import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { catchError, debounceTime, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Id } from '../../../shared/models/entity';
import { SocketService } from '../../../shared/services/socket/socket.service';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
import { TranslateService } from '../../../shared/services/translate/translate.service';
import {
  UNKNOW_WORKSPACE,
  Workspace,
  WorkspaceRequest,
} from '../models/workspace';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly sonner = inject(SonnerService);
  private readonly translate = inject(TranslateService);
  private readonly auth = inject(AuthService);
  private readonly socket = inject(SocketService);

  constructor() {
    this.listenForSocketEvents();
  }

  public workspaces(): Signal<Workspace[]> {
    return computed(() => {
      const id = this.auth.currentUserInfo()?.id;
      if (!id || !this.store.usersWorkspaces().has(id)) return [];
      return Array.from(
        this.store.usersWorkspaces().get(id)!,
        (id) => this.store.workspaces().get(id) ?? UNKNOW_WORKSPACE
      );
    });
  }

  public workspaceById(id: Id | null | undefined) {
    return computed(() => (id ? this.store.workspaces().get(id) : undefined));
  }

  public getWorkspaces(): Observable<Workspace[]> {
    const id = this.auth.currentUserInfo()?.id;
    if (!id || this.store.usersWorkspaces().has(id)) return of([]);
    return this.http.get<Workspace[]>(`${environment.apiUrl}/workspace`).pipe(
      debounceTime(150),
      tap((workspaces) => this.setWorkspacesToStore(id, workspaces)),
      catchError((err) => {
        console.error('Error fetching workspaces:', err);
        this.sonner.error(this.translate.translate('workspace.get.error'));
        return of([]);
      })
    );
  }

  public createWorkspace(req: WorkspaceRequest): Observable<boolean> {
    return this.http
      .post<Workspace>(`${environment.apiUrl}/workspace`, req)
      .pipe(
        debounceTime(150),
        tap((workspace) => {
          this.addWorkspaceToStore(workspace);
          this.sonner.success(
            this.translate.translate('workspace.create.success')
          );
        }),
        map(() => true),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.translate.translate('workspace.create.error'));
          return of(false);
        })
      );
  }

  public updateWorkspace(
    id: string,
    req: WorkspaceRequest
  ): Observable<boolean> {
    return this.http
      .put<Workspace>(`${environment.apiUrl}/workspace/${id}`, req)
      .pipe(
        debounceTime(150),
        tap((workspace) => {
          this.addWorkspaceToStore(workspace);
          this.sonner.success(
            this.translate.translate('workspace.update.success')
          );
        }),
        map(() => true),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.translate.translate('workspace.update.error'));
          return of(false);
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
          this.sonner.error(this.translate.translate('workspace.get.error'));
          return of(undefined);
        })
      );
  }

  private listenForSocketEvents() {
    this.socket.onEvent('WorkspaceCreated', (workspace: Workspace) => {
      console.log('WorkspaceCreated', workspace);
      this.addWorkspaceToStore(workspace);
    });
    this.socket.onEvent('WorkspaceUpdated', (workspace: Workspace) => {
      console.log('WorkspaceUpdated', workspace);
      this.addWorkspaceToStore(workspace);
    });
    this.socket.onEvent('WorkspaceAdded', (workspace: Workspace) => {
      console.log('WorkspaceAdded', workspace);
      this.addWorkspaceToStore(workspace);
    });
  }

  private setWorkspacesToStore(userId: Id, workspaces: Workspace[]) {
    this.store.setEntities('workspaces', workspaces);
    this.store.setRelation(
      'usersWorkspaces',
      userId,
      workspaces.map((w) => w.id)
    );
  }

  private addWorkspaceToStore(workspace: Workspace) {
    const userId = this.auth.currentUserInfo()?.id;
    if (userId) {
      this.store.addToRelation('usersWorkspaces', userId, workspace.id);
    }
    this.store.setEntity('workspaces', workspace);
  }
}
