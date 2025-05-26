import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { catchError, debounceTime, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { UNKNOW_USER, User } from '../../../core/auth/models/auth';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Id } from '../../../shared/models/entity';
import { SocketService } from '../../../shared/services/socket/socket.service';
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
  private readonly socket = inject(SocketService);

  constructor() {
    this.handleSocketEvents();
  }

  public contacts() {
    return computed(() => {
      const id = this.auth.currentUserInfo()?.id;
      if (!id || !this.store.usersContacts().has(id)) {
        return [];
      }
      return Array.from(
        this.store.usersContacts().get(id)!,
        (id) => this.store.users().get(id) ?? UNKNOW_USER
      );
    });
  }

  public getContacts(): Observable<User[]> {
    const id = this.auth.currentUserInfo()?.id ?? '';
    if (this.store.usersContacts().has(id)) return of([]);
    return this.http.get<User[]>(`${environment.apiUrl}/user/contacts`).pipe(
      debounceTime(150),
      tap((contacts) => this.addContactsToStore(id, contacts)),
      catchError((err) => {
        console.error('Error fetching contacts:', err);
        this.sonner.error(this.translate.translate('contact.get.error'));
        return of([]);
      })
    );
  }

  public removeContact(contactId: Id) {
    // TODO
  }

  private handleSocketEvents() {
    this.socket.onEvent<User>('ContactAdded', (contact) => {
      console.log('ContactAdded', contact);
      this.addContactToStore(contact);
    });
    this.socket.onEvent<Id>('ContactRemoved', (id) => {
      console.log('ContactRemoved', id);
      this.removeContactFromStore(id);
    });
  }

  private addContactToStore(contact: User) {
    const userId = this.auth.currentUserInfo()?.id;
    if (userId) {
      this.store.setEntity('users', contact);
      this.store.addToRelation('usersContacts', userId, contact.id);
    }
  }

  private addContactsToStore(userId: Id, contacts: User[]) {
    this.store.setEntities('users', contacts);
    this.store.setRelation(
      'usersContacts',
      userId,
      contacts.map((c) => c.id)
    );
  }

  private removeContactFromStore(contactId: Id) {
    const userId = this.auth.currentUserInfo()?.id;
    if (userId) {
      this.store.deleteFromRelation('usersContacts', userId, contactId);
    }
  }
}
