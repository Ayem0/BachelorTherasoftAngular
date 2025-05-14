import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, firstValueFrom, map, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SocketService } from '../../../shared/services/socket/socket.service';
import { User } from '../models/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly socket = inject(SocketService);
  private currentUser = signal<User | null>(null);
  public currentUserInfo = computed(() => this.currentUser());
  public isLoggedIn = computed(() => !!this.currentUser());

  public login(email: string, password: string) {
    return this.http
      .post(
        `${environment.apiUrl}/login`,
        { email, password },
        { params: { useCookies: true }, observe: 'response' }
      )
      .pipe(
        tap(async (res) => {
          if (res.ok) {
            await firstValueFrom(this.getUserInfo());
          }
        }),
        map((res) => res.ok),
        catchError(() => of(false))
      );
  }

  public register(email: string, password: string, confirmPassword: string) {
    return this.http
      .post(
        `${environment.apiUrl}/register`,
        { email, password, confirmPassword },
        { observe: 'response' }
      )
      .pipe(
        map((res) => res.ok),
        catchError(() => of(false))
      );
  }

  public logout() {
    return this.http
      .post(
        `${environment.apiUrl}/api/auth/logout`,
        {},
        { observe: 'response' }
      )
      .pipe(
        tap((res) => {
          if (res.ok) {
            this.currentUser.set(null);
            this.socket.endConnection();
          }
        }),
        map((res) => res.ok),
        catchError(() => of(false))
      );
  }

  public getUserInfo() {
    return this.http.get<User>(`${environment.apiUrl}/api/user`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.socket.startConnection();
      }),
      catchError(() => {
        this.currentUser.set(null);
        return of(null);
      })
    );
  }

  public updateUserInfo(firstname: string, lastname: string) {
    return this.http
      .put<User>(`${environment.apiUrl}/api/user`, { firstname, lastname })
      .pipe(
        tap((user) => this.currentUser.set(user)),
        catchError((err) => {
          console.log(err);
          return of(null);
        })
      );
  }
}
