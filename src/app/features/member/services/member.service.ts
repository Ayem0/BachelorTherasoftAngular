import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/auth/models/auth';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
import { TranslateService } from '../../../shared/services/translate/translate.service';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly sonner = inject(SonnerService);
  private readonly translate = inject(TranslateService);

  constructor() {}

  public membersByWorkspaceId(id: string) {
    return computed(() =>
      this.store.workspacesUsers().has(id)
        ? Array.from(
            this.store.workspacesUsers().get(id)!,
            (i) => this.store.users().get(i)!
          )
        : []
    );
  }

  public async getMembersByWorkspaceId(id: string) {
    await firstValueFrom(
      this.http
        .get<User[]>(`${environment.apiUrl}/api/member/workspace/${id}`)
        .pipe(
          tap({
            next: (users) => {
              this.store.setEntities('users', users);
              this.store.setRelation(
                'workspacesUsers',
                id,
                users.map((u) => u.id)
              );
            },
            error: (err) => {
              console.error(err);
              this.sonner.error(this.translate.translate('member.get.error'));
            },
          })
        )
    );
  }
}
