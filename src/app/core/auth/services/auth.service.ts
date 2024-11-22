import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../models/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor() { 
    this.me()
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
      catchError(() => {
        this.currentUserSubject.next(null);
        return of(null);
      })
    ).subscribe();
  }

  public isAuthenticated() {
    return this.currentUser$.pipe(
      map(user => !!user)
    );
  }
}
