import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly url = "http://localhost:8080/"

  private isAuth = signal(false); 
  public readonly isLoggedIn = computed(this.isAuth);

  constructor(
  ) { }

  public login(email: string, password: string) {
    return this.http.post(`${this.url}login`, { email, password }, 
      { 
        params: {"useCookies": true }, 
        observe: "response",
        withCredentials: true
      }).pipe(
        tap(res => {
          if(res.ok) {
            this.isAuth.set(true);
          }
        }),
        map(res => res.ok)
      )
  }

  public register(email: string, password: string, confirmPassword: string) {
    return this.http.post(`${this.url}register`, { email, password, confirmPassword })
  }
}
