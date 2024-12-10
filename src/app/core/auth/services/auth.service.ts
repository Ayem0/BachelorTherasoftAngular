import { Inject, inject, Injectable, makeStateKey, Optional, PLATFORM_ID, TransferState } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, of, take, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../models/auth';
import { isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platform = inject(PLATFORM_ID);
  private readonly transferState = inject(TransferState);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    @Optional() @Inject('SERVER_COOKIES') private serverCookies: any
  ) {
    const USER_STATE_KEY = makeStateKey<User | null>('currentUser');
    if (isPlatformServer(this.platform)) {
      console.log("Server")
      this.me().pipe(
        take(1),
        tap((res) => {
          this.transferState.set(USER_STATE_KEY, res);
        })
      ).subscribe();
    } else {
      console.log("Client")
      this.currentUserSubject.next(this.transferState.get(USER_STATE_KEY, null));
    }
  }

  public login(email: string, password: string) {
    return this.http.post(`${environment.apiUrl}/login`, { email, password }, { params: { useCookies: true }, observe: "response" })
      .pipe(
        tap(res => {
          if(res.ok) {
            this.currentUserSubject.next({
              id: "oe",
              email: "test@test.com"
            });
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
          this.currentUserSubject.next(null);
        }
      }),
      map(res => res.ok),
      catchError(() => of(false))
    )
  }

  private createHeadersWithCookies(): HttpHeaders {
    if (isPlatformServer(this.platform) && this.serverCookies) {
      const cookieString = Object.entries(this.serverCookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');

      return new HttpHeaders({
        Cookie: cookieString,
      });
    }
    return new HttpHeaders();
  }

  /** Get user info */
  private me() {
    const headers = this.createHeadersWithCookies();
    console.log(headers)
    return this.http.get<User>(`http://localhost:8080/api/auth/me`, { headers }).pipe(
      tap(user => this.currentUserSubject.next(user)),
      catchError((err) => {
        console.log(err)
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  public isAuthenticated() {
    return this.currentUser$.pipe(
      map(user => !!user)
    );
  }
}
