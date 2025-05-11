import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { User } from '../../../core/auth/models/auth';
import { AuthService } from '../../../core/auth/services/auth.service';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
import { TranslateService } from '../../../shared/services/translate/translate.service';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly sonner = inject(SonnerService);
  private readonly translate = inject(TranslateService);
  private readonly store = inject(Store);
  private readonly auth = inject(AuthService);

  public contacts() {
    const id = this.auth.currentUserInfo()?.id;
    return computed(() =>
      id
        ? this.store.usersContacts().has(id)
          ? Array.from(
              this.store.usersContacts().get(id)!,
              (id) => this.store.users().get(id)!
            )
          : []
        : []
    );
  }

  public async getContacts() {
    const id = this.auth.currentUserInfo()?.id;
    if (!id || this.store.usersContacts().has(id)) return;

    await firstValueFrom(
      this.http.get<User[]>(`${environment.apiUrl}/api/user/contact`).pipe(
        tap({
          next: (contacts) => {
            this.store.setEntities('users', contacts);
            this.store.setRelation(
              'usersContacts',
              id,
              contacts.map((i) => i.id)
            );
          },
          error: (err) => {
            console.error('Error fetching contacts:', err);
            this.sonner.error(this.translate.translate('contact.get.error'));
          },
        })
      )
    );
  }
}
