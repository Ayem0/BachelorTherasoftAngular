import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Member } from './member';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private readonly http = inject(HttpClient);
  constructor() { }

  public getMembersByWorkspaceId(workspaceId: string) {
    return this.http.get<Member[]>(`${environment.apiUrl}/api/member/workspace`, { params: { workspaceId }});
  }

  public createMember(
    workspaceId: string,
    name: string,
    description?: string,
  ) {
    return this.http.post<Member>(`${environment.apiUrl}/api/member`, 
      { workspaceId, name, description }
    );
  }

  public updateMember(
    workspaceId: string,
    id: string,
    roles: string[]
  ) {
    return this.http.put<Member>(`${environment.apiUrl}/api/member?`, 
      { roles }, { params: { workspaceId, id } })
  }

  public getMemberDetailsById(id: string) {
    return this.http.get<Member>(`${environment.apiUrl}/api/member/details`, { params: { id } });
  }
}
