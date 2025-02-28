import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Tag, TagRequest } from './tag';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private readonly http = inject(HttpClient);
  constructor() {}

  public getTagsByWorkspaceId(workspaceId: string) {
    return this.http.get<Tag[]>(`${environment.apiUrl}/api/tag/workspace`, {
      params: { workspaceId },
    });
  }

  public createTag(workspaceId: string, req: TagRequest) {
    return this.http.post<Tag>(`${environment.apiUrl}/api/tag`, {
      workspaceId: workspaceId,
      name: req.name,
      color: req.color,
      icon: req.icon,
      description: req.description,
    });
  }

  public updateTag(id: string, req: TagRequest) {
    return this.http.put<Tag>(
      `${environment.apiUrl}/api/tag`,
      {
        name: req.name,
        color: req.color,
        icon: req.icon,
        description: req.description,
      },
      { params: { id: id } }
    );
  }

  public gettagDetailsById(id: string) {
    return this.http.get<Tag>(`${environment.apiUrl}/api/tag/details`, {
      params: { id: id },
    });
  }
}
