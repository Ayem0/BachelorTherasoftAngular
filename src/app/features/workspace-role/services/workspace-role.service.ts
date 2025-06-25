import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { catchError, debounceTime, map, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Id } from '../../../shared/models/entity';
import { LocaleService } from '../../../shared/services/locale/locale.service';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store.service';
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
  private readonly locale = inject(LocaleService);

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

  public getWorkspaceRolesByWorkspaceId(workspaceId: string) {
    if (this.store.workspacesWorkspaceRoles().has(workspaceId)) return of([]);
    return this.http
      .get<WorkspaceRole[]>(
        `${environment.apiUrl}/workspace/${workspaceId}/workspaceRoles`
      )
      .pipe(
        debounceTime(150),
        tap((wrs) => {
          this.store.setEntities('workspaceRoles', wrs);
          this.store.setRelation(
            'workspacesWorkspaceRoles',
            workspaceId,
            wrs.map((w) => w.id)
          );
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.locale.translate('workspaceRole.get.error'));
          return of([]);
        })
      );
  }

  public createWorkspaceRole(workspaceId: string, req: WorkspaceRoleRequest) {
    return this.http
      .post<WorkspaceRole>(`${environment.apiUrl}/workspaceRole`, {
        workspaceId,
        ...req,
      })
      .pipe(
        debounceTime(150),
        map((wr) => {
          this.store.setEntity('workspaceRoles', wr);
          this.store.addToRelation(
            'workspacesWorkspaceRoles',
            workspaceId,
            wr.id
          );
          this.sonner.success(
            this.locale.translate('workspaceRole.create.success')
          );
          return true;
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.locale.translate('workspaceRole.create.error')
          );
          return of(false);
        })
      );
  }

  public updateWorkspaceRole(id: string, req: WorkspaceRoleRequest) {
    return this.http
      .put<WorkspaceRole>(`${environment.apiUrl}/WorkspaceRole/${id}`, req)
      .pipe(
        debounceTime(150),
        map((wr) => {
          this.store.setEntity('workspaceRoles', wr);
          this.sonner.success(
            this.locale.translate('workspaceRole.update.success')
          );
          return true;
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.locale.translate('workspaceRole.update.error')
          );
          return of(false);
        })
      );
  }

  public getWorkspaceRoleById(workspaceId: string, id: string) {
    if (this.store.workspaceRoles().has(id)) return of(null);
    return this.http
      .get<WorkspaceRole>(
        `${environment.apiUrl}/workspace/${workspaceId}/WorkspaceRole/${id}`
      )
      .pipe(
        debounceTime(150),
        tap((wr) => this.store.setEntity('workspaceRoles', wr)),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.locale.translate('workspaceRole.get.error'));
          return of(null);
        })
      );
  }
}
