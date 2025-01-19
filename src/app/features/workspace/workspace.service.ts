import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Workspace } from './workspace';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private readonly http = inject(HttpClient);
  constructor() { }

  public getWorkspacesByUser() {
    return this.http.get<Workspace[]>(`${environment.apiUrl}/api/workspace/user`);
  }

  public createWorkspace(name: string, description?: string) {
    return this.http.post<Workspace>(`${environment.apiUrl}/api/workspace`, { name, description })
  }

  public updateWorkspace(id: string, newName: string, newDescription?: string) {
    return this.http.put<Workspace>(`${environment.apiUrl}/api/workspace`, { newName, newDescription }, { params: { id } })
  }

  public getWorkspaceById(id: string) {
    return this.http.get<Workspace>(`${environment.apiUrl}/api/workspace`, { params: { id } });
  }
}
