import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Member } from '../models/member';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private readonly http = inject(HttpClient);
  constructor() {}

  public getMembersByWorkspaceId(id: string) {
    return this.http.get<Member[]>(
      `${environment.apiUrl}/api/member/workspace/${id}`
    );
  }
}
