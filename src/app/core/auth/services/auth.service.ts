import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, of, take, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../models/auth';
import { isPlatformServer } from '@angular/common';
import { SocketService } from '../../../shared/services/socket/socket.service';

// const USER_STATE_KEY = makeStateKey<User | null>('currentUser');

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  // private readonly transferState = inject(TransferState);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private readonly socket = inject(SocketService);

  constructor(
  ) {
    this.me().pipe(
      take(1),
      tap((res) => {
        this.currentUserSubject.next(res);
        if (res) {
          this.socket.startConnection()
          this.socket.onEvent<string>('WorkspaceUpdated', (message) => {
            console.log('Workspace updated:', message);
            // Handle the event data (e.g., update UI)
          });
        }
      })
    ).subscribe();
    // const platform = inject(PLATFORM_ID);
    // if (isPlatformServer(platform)) {
    //   console.log("Server")
    //   const request = inject(REQUEST) as any;
    //   const cookieHeader = request?.headers?.cookie;
    //   if (cookieHeader) {
    //     this.me(cookieHeader).pipe(
    //       take(1),
    //       tap((res) => {
    //         this.transferState.set(USER_STATE_KEY, res);
    //         const userState= this.transferState.get(USER_STATE_KEY, null);
    //         console.log(userState);
    //         console.log(this.currentUserSubject.value)
    //       })
    //     ).subscribe();
    //   }
    // } else {
    //   console.log("Client")
    //   const userState = this.transferState.get(USER_STATE_KEY, null);
    //   console.log(userState);
    //   if (userState) {
    //     this.currentUserSubject.next(userState);
    //   }
    // }
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

  /** Get user info */
  private me() {
    return this.http.get<User>(`${environment.apiUrl}/api/auth/me`).pipe(
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
