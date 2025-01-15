import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Tag } from './tag';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private readonly http = inject(HttpClient);
  constructor() { }

  public getTagsByWorkspaceId(workspaceId: string) {
    return this.http.get<Tag[]>(`${environment.apiUrl}/api/tag/workspace?workspaceId=${workspaceId}`);
  }

  public createTag(
    workspaceId: string,
    name: string,
    color: string,
    icon: string,
    description?: string,
  ) {
    return this.http.post<Tag>(`${environment.apiUrl}/api/tag`, 
      { workspaceId, name, color, icon, description }
    );
  }

  public updateTag(
    id: string,
    name: string,
    color: string,
    icon: string,
    description?: string,
  ) {
    return this.http.put<Tag>(`${environment.apiUrl}/api/tag?`, 
      { id, name, color, icon, description }, { params: { id: id } })
  }

  public gettagDetailsById(id: string) {
    return this.http.get<Tag>(`${environment.apiUrl}/api/tag/details`, { params: { id: id } });
  }
}
