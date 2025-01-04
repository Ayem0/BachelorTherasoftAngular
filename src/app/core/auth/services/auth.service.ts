import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, map, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../models/auth';
import { SocketService } from '../../../shared/services/socket/socket.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  public currentUser = signal<User | null | undefined>(undefined);

  private readonly socket = inject(SocketService);

  constructor() {}

  public login(email: string, password: string) {
    return this.http.post(`${environment.apiUrl}/login`, { email, password }, { params: { useCookies: true }, observe: "response" })
      .pipe(
        tap(async res => {
          if(res.ok) {
            await firstValueFrom(this.getUserInfo());
          }
        }),
        map(res => res.ok),
        catchError(() => of(false))
      )
  }

  public register(email: string, password: string, confirmPassword: string) {
    return this.http.post(`${environment.apiUrl}/register`, { email, password, confirmPassword }, { observe: "response" })
      .pipe(
        map(res => res.ok),
        catchError(() => of(false))
      )
  }

  public logout() {
    return this.http.post(`${environment.apiUrl}/api/auth/logout`, {}, { observe: "response" }).pipe(
      tap(res => {
        if (res.ok) {
          this.currentUser.set(null);
        }
      }),
      map(res => res.ok),
      catchError(() => of(false))
    )
  }

  /** Get user info */
  public getUserInfo() {
    return this.http.get<User>(`${environment.apiUrl}/api/auth/me`).pipe(
      tap(user => {
        this.currentUser.set(user)
        this.socket.startConnection();
      }),
      catchError((err) => {
        console.log(err)
        this.currentUser.set(null);
        return of(null);
      })
    );
  }
}
