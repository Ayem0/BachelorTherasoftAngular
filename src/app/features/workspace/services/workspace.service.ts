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
    return this.http.get<Workspace[]>(`${environment.apiUrl}/workspace/user`);
  }

  public createWorkspace(name: string, description: string) {
    return this.http.post<Workspace>(`${environment.apiUrl}/workspace`, { name, description })
  }
}
