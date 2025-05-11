import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Id } from '../../../shared/models/entity';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
import { TranslateService } from '../../../shared/services/translate/translate.service';
import {
  UNKNOW_WORKSPACE_ROLE,
  WorkspaceRole,
  WorkspaceRoleRequest,
} from '../models/workspace-role';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceRoleService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly sonner = inject(SonnerService);
  private readonly translate = inject(TranslateService);

  public workspaceRolesByWorkspaceId(id: Id): Signal<WorkspaceRole[]> {
    return computed(() =>
      this.store.workspacesWorkspaceRoles().has(id)
        ? Array.from(
            this.store.workspacesWorkspaceRoles().get(id)!,
            (i) => this.store.workspaceRoles().get(i) ?? UNKNOW_WORKSPACE_ROLE
          )
        : []
    );
  }

  public workspaceRoleById(
    id: Id | null | undefined
  ): Signal<WorkspaceRole | undefined> {
    return computed(() =>
      id ? this.store.workspaceRoles().get(id) : undefined
    );
  }

  public async getWorkspaceRolesByWorkspaceId(workspaceId: string) {
    if (this.store.workspacesWorkspaceRoles().has(workspaceId)) {
      return;
    }
    await firstValueFrom(
      this.http
        .get<WorkspaceRole[]>(
          `${environment.apiUrl}/api/WorkspaceRole/workspace?id=${workspaceId}`
        )
        .pipe(
          tap({
            next: (workspaceRoles) => {
              this.store.setEntities('workspaceRoles', workspaceRoles);
              this.store.setRelation(
                'workspacesWorkspaceRoles',
                workspaceId,
                workspaceRoles.map((w) => w.id)
              );
            },
            error: (error) => {
              console.error(error);
              this.sonner.error(
                this.translate.translate('workspaceRole.get.error')
              );
            },
          })
        )
    );
  }

  public async createWorkspaceRole(
    workspaceId: string,
    req: WorkspaceRoleRequest
  ) {
    let isSuccess = true;
    await firstValueFrom(
      this.http
        .post<WorkspaceRole>(`${environment.apiUrl}/api/WorkspaceRole`, {
          workspaceId,
          ...req,
        })
        .pipe(
          tap({
            next: (workspaceRole) => {
              this.store.setEntity('workspaceRoles', workspaceRole);
              this.store.setRelation('workspacesWorkspaceRoles', workspaceId, [
                workspaceRole.id,
              ]);
            },
            error: (error) => {
              console.error(error);
              isSuccess = false;
            },
          })
        )
    );
    return isSuccess;
  }

  public async updateWorkspaceRole(id: string, req: WorkspaceRoleRequest) {
    let isSuccess = true;
    await firstValueFrom(
      this.http
        .put<WorkspaceRole>(
          `${environment.apiUrl}/api/WorkspaceRole?id=${id}`,
          req
        )
        .pipe(
          tap({
            next: (workspaceRole) => {
              this.store.setEntity('workspaceRoles', workspaceRole);
              this.sonner.success(
                this.translate.translate('workspaceRole.update.success')
              );
            },
            error: (error) => {
              console.error(error);
              isSuccess = false;
              this.sonner.error(
                this.translate.translate('workspaceRole.update.error')
              );
            },
          })
        )
    );
    return isSuccess;
  }

  public async getWorkspaceRoleById(id: string) {
    if (this.store.workspaceRoles().has(id)) {
      return;
    }
    await firstValueFrom(
      this.http
        .get<WorkspaceRole>(
          `${environment.apiUrl}/api/WorkspaceRole/details?id=${id}`
        )
        .pipe(
          tap({
            next: (workspaceRole) => {
              this.store.setEntity('workspaceRoles', workspaceRole);
            },
            error: (error) => {
              console.error(error);
              this.sonner.error(
                this.translate.translate('workspaceRole.get.error')
              );
            },
          })
        )
    );
  }
}
