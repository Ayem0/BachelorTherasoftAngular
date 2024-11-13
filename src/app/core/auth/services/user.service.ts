import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { user } from '../models/auth';
import { catchError, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly url = "http://localhost:8080/"

  private currentUser = signal<user | null>(null);
  public readonly user = computed(this.currentUser);

  constructor() { }


}
