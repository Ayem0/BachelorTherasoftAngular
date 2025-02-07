import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Workspace, WorkspaceRequest } from './workspace';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private readonly http = inject(HttpClient);
  constructor() {}

  public getWorkspacesByUser() {
    return this.http.get<Workspace[]>(
      `${environment.apiUrl}/api/workspace/user`
    );
  }

  public createWorkspace(req: WorkspaceRequest) {
    return this.http.post<Workspace>(`${environment.apiUrl}/api/workspace`, {
      name: req.name,
      description: req.description,
    });
  }

  public updateWorkspace(id: string, req: WorkspaceRequest) {
    return this.http.put<Workspace>(
      `${environment.apiUrl}/api/workspace`,
      { name: req.name, description: req.description },
      { params: { id } }
    );
  }

  public getWorkspaceById(id: string) {
    return this.http.get<Workspace>(`${environment.apiUrl}/api/workspace`, {
      params: { id },
    });
  }
}
