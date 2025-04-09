import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { WorkspaceRole, WorkspaceRoleRequest } from '../models/workspace-role';
import { WorkspaceRoleStore } from './workspace-role.store';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceRoleService {
  private readonly http = inject(HttpClient);
  private readonly workspaceRoleStore = inject(WorkspaceRoleStore);

  public selectedWorkspaceId = signal<string | null>(null);
  public readonly workspaceRolesBySelectedWorkspaceId: Signal<WorkspaceRole[]> =
    computed(() =>
      this.selectedWorkspaceId() === null
        ? []
        : this.workspaceRoleStore
            .workspaceRolesArr()
            .filter((wr) => wr.workspaceId === this.selectedWorkspaceId())
    );

  public async getWorkspaceRolesByWorkspaceId(workspaceId: string) {
    await firstValueFrom(
      this.http
        .get<WorkspaceRole[]>(
          `${environment.apiUrl}/api/WorkspaceRole/workspace`,
          { params: { workspaceId } }
        )
        .pipe(
          tap({
            next: (workspaceRoles) => {
              this.workspaceRoleStore.setWorkspaceRoles(
                workspaceRoles.map((workspaceRole) => ({
                  ...workspaceRole,
                  workspaceId: workspaceId,
                }))
              );
            },
            error: (error) => {
              console.error(error);
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
          name: req.name,
          description: req.description,
        })
        .pipe(
          tap({
            next: (workspaceRole) => {
              this.workspaceRoleStore.setWorkspaceRole({
                ...workspaceRole,
                workspaceId: workspaceId,
              });
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

  public async updateWorkspaceRole(
    id: string,
    workspaceId: string,
    req: WorkspaceRoleRequest
  ) {
    let isSuccess = true;
    await firstValueFrom(
      this.http
        .put<WorkspaceRole>(
          `${environment.apiUrl}/api/WorkspaceRole`,
          { name: req.name, description: req.description },
          { params: { id: id } }
        )
        .pipe(
          tap({
            next: (workspaceRole) => {
              this.workspaceRoleStore.setWorkspaceRole({
                ...workspaceRole,
                workspaceId: workspaceId,
              });
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

  public async getWorkspaceRoleById(id: string, workspaceId: string) {
    await firstValueFrom(
      this.http
        .get<WorkspaceRole>(`${environment.apiUrl}/api/WorkspaceRole/details`, {
          params: { id: id },
        })
        .pipe(
          tap({
            next: (workspaceRole) => {
              this.workspaceRoleStore.setWorkspaceRole({
                ...workspaceRole,
                workspaceId: workspaceId,
              });
            },
            error: (error) => {
              console.error(error);
            },
          })
        )
    );
  }
}
