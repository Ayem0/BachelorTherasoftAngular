import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { WorkspaceRole } from './workspace-role';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceRoleService {
  private readonly http = inject(HttpClient);
  constructor() { }

  public getWorkspaceRolesByWorkspaceId(workspaceId: string) {
    return this.http.get<WorkspaceRole[]>(`${environment.apiUrl}/api/WorkspaceRole/workspace?workspaceId=${workspaceId}`);
  }

  public createWorkspaceRole(
    workspaceId: string,
    name: string,
    description?: string,
  ) {
    return this.http.post<WorkspaceRole>(`${environment.apiUrl}/api/WorkspaceRole`, 
      { workspaceId, name, description }
    );
  }

  public updateWorkspaceRole(
    id: string,
    name: string,
    description?: string,
  ) {
    return this.http.put<WorkspaceRole>(`${environment.apiUrl}/api/WorkspaceRole?`, 
      { id, name, description }, { params: { id: id } })
  }

  public getWorkspaceRoleDetailsById(id: string) {
    return this.http.get<WorkspaceRole>(`${environment.apiUrl}/api/WorkspaceRole/details`, { params: { id: id } });
  }
}
