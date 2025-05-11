import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Id } from '../../../shared/models/entity';
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

  public workspaces(): Signal<Workspace[]> {
    return computed(() =>
      this.auth.currentUserInfo()
        ? this.store.usersWorkspaces().has(this.auth.currentUserInfo()!.id)
          ? Array.from(
              this.store
                .usersWorkspaces()
                .get(this.auth.currentUserInfo()!.id)!,
              (id) => this.store.workspaces().get(id) ?? UNKNOW_WORKSPACE
            )
          : []
        : []
    );
  }

  public workspaceById(id: Id | null | undefined) {
    return computed(() => (id ? this.store.workspaces().get(id) : undefined));
  }

  public async getWorkspaces() {
    const id = this.auth.currentUserInfo()?.id;
    if (!id || this.store.usersWorkspaces().has(id)) {
      return;
    }
    await firstValueFrom(
      this.http
        .get<Workspace[]>(`${environment.apiUrl}/api/workspace/user`)
        .pipe(
          tap({
            next: (workspaces) => {
              this.store.setEntities('workspaces', workspaces);
              this.store.setRelation(
                'usersWorkspaces',
                id,
                workspaces.map((w) => w.id)
              );
            },
            error: (err) => {
              console.error('Error fetching workspaces:', err);
              this.sonner.error(
                this.translate.translate('workspace.get.error')
              );
            },
          })
        )
    );
  }

  public async createWorkspace(req: WorkspaceRequest) {
    let isSuccess = true;
    await firstValueFrom(
      this.http
        .post<Workspace>(`${environment.apiUrl}/api/workspace`, req)
        .pipe(
          tap({
            next: (workspace) => {
              this.store.setEntity('workspaces', workspace);
              this.sonner.success(
                this.translate.translate('workspace.create.success')
              );
            },
            error: (err) => {
              console.error(err);
              this.sonner.error(
                this.translate.translate('workspace.create.error')
              );
              isSuccess = false;
            },
          })
        )
    );
    return isSuccess;
  }

  public async updateWorkspace(id: string, req: WorkspaceRequest) {
    let isSuccess = true;
    await firstValueFrom(
      this.http
        .put<Workspace>(`${environment.apiUrl}/api/workspace?id=${id}`, req)
        .pipe(
          tap({
            next: (workspace) => {
              this.store.setEntity('workspaces', workspace);
              this.sonner.success(
                this.translate.translate('workspace.update.success')
              );
            },
            error: (err) => {
              console.error(err);
              this.sonner.error(
                this.translate.translate('workspace.update.error')
              );
              isSuccess = false;
            },
          })
        )
    );
    return isSuccess;
  }

  public async getWorkspaceById(id: string) {
    if (this.store.workspaces().has(id)) {
      return;
    }
    await firstValueFrom(
      this.http
        .get<Workspace>(`${environment.apiUrl}/api/workspace?id=${id}`)
        .pipe(
          tap({
            next: (workspace) => {
              this.store.setEntity('workspaces', workspace);
            },
            error: (err) => {
              console.error(err);
              this.sonner.error(
                this.translate.translate('workspace.get.error')
              );
            },
          })
        )
    );
  }
}
