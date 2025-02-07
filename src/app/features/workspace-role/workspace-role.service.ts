import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { WorkspaceRole, WorkspaceRoleRequest } from './workspace-role';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceRoleService {
  private readonly http = inject(HttpClient);
  constructor() {}

  public getWorkspaceRolesByWorkspaceId(workspaceId: string) {
    return this.http.get<WorkspaceRole[]>(
      `${environment.apiUrl}/api/WorkspaceRole/workspace`,
      { params: { workspaceId } }
    );
  }

  public createWorkspaceRole(workspaceId: string, req: WorkspaceRoleRequest) {
    return this.http.post<WorkspaceRole>(
      `${environment.apiUrl}/api/WorkspaceRole`,
      { workspaceId, name: req.name, description: req.description }
    );
  }

  public updateWorkspaceRole(id: string, req: WorkspaceRoleRequest) {
    return this.http.put<WorkspaceRole>(
      `${environment.apiUrl}/api/WorkspaceRole?`,
      { name: req.name, description: req.description },
      { params: { id: id } }
    );
  }

  public getWorkspaceRoleDetailsById(id: string) {
    return this.http.get<WorkspaceRole>(
      `${environment.apiUrl}/api/WorkspaceRole/details`,
      { params: { id: id } }
    );
  }
}
