import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Workspace } from '../models/workspace';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private readonly http = inject(HttpClient);
  constructor() { }

  public getWorkspaceByUserId() {
    return this.http.get<Partial<Workspace>[]>(`${environment.apiUrl}/api/workspace/user`);
  }

  public createWorkspace(name: string, description: string) {
    return this.http.post<Partial<Workspace>>(`${environment.apiUrl}/api/workspace`, { name, description })
  }

  public getWorkspaceDetailsById(id: string) {
    return this.http.get<Workspace>(`${environment.apiUrl}/api/workspace/details`, { params: { id: id } });
  }
}
