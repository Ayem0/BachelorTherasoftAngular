import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Id } from '../../../shared/models/entity';
import { Workspace, WorkspaceRequest } from '../models/workspace';
import { WorkspaceStore } from './workspace.store';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private readonly http = inject(HttpClient);
  private readonly workspaceStore = inject(WorkspaceStore);

  public workspaces = this.workspaceStore.workspacesArr;
  public selectedWorkspaceId = signal<Id | null>(null);
  public workspaceBySelectedId = computed(() =>
    this.selectedWorkspaceId()
      ? this.workspaceStore.workspaces().get(this.selectedWorkspaceId()!) ??
        null
      : null
  );
  public async getWorkspacesByUser() {
    await firstValueFrom(
      this.http
        .get<Workspace[]>(`${environment.apiUrl}/api/workspace/user`)
        .pipe(
          tap({
            next: (workspaces) => {
              this.workspaceStore.setWorkspaces(workspaces);
            },
            error: (err) => {
              console.log(err);
            },
          })
        )
    );
  }

  public async createWorkspace(req: WorkspaceRequest) {
    let isSuccess = true;
    await firstValueFrom(
      this.http
        .post<Workspace>(`${environment.apiUrl}/api/workspace`, {
          name: req.name,
          description: req.description,
        })
        .pipe(
          tap({
            next: (workspace) => {
              this.workspaceStore.setWorkspace(workspace);
            },
            error: (err) => {
              console.log(err);
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
        .put<Workspace>(
          `${environment.apiUrl}/api/workspace`,
          { name: req.name, description: req.description },
          { params: { id } }
        )
        .pipe(
          tap({
            next: (workspace) => {
              this.workspaceStore.setWorkspace(workspace);
            },
            error: (err) => {
              console.log(err);
              isSuccess = false;
            },
          })
        )
    );
    return isSuccess;
  }

  public async getWorkspaceById(id: string) {
    await firstValueFrom(
      this.http
        .get<Workspace>(`${environment.apiUrl}/api/workspace`, {
          params: { id },
        })
        .pipe(
          tap({
            next: (workspace) => {
              this.workspaceStore.setWorkspace(workspace);
            },
            error: (err) => {
              console.log(err);
            },
          })
        )
    );
  }
}
