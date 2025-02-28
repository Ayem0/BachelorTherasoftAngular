import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { User } from '../../../core/auth/models/auth';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private readonly http = inject(HttpClient);
  constructor() {}

  public GetUserContacts() {
    return this.http.get<User[]>(`${environment.apiUrl}/api/user/contact`);
  }
}
