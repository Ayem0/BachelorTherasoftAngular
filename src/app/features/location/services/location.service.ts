import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { catchError, debounceTime, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
import { TranslateService } from '../../../shared/services/translate/translate.service';
import { Location, LocationRequest, UNKNOW_LOCATION } from '../models/location';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly sonner = inject(SonnerService);
  private readonly translate = inject(TranslateService);

  constructor() {}

  public locationsByWorkspaceId(id: string): Signal<Location[]> {
    return computed(() =>
      this.store.workspacesLocations().has(id)
        ? Array.from(
            this.store.workspacesLocations().get(id)!,
            (i) => this.store.locations().get(i) ?? UNKNOW_LOCATION
          )
        : []
    );
  }

  public locationById(
    id: string | null | undefined
  ): Signal<Location | undefined> {
    return computed(() => (id ? this.store.locations().get(id) : undefined));
  }

  public getLocationsByWorkspaceId(id: string): Observable<Location[]> {
    if (this.store.workspacesLocations().has(id)) return of([]);

    return this.http
      .get<Location[]>(`${environment.apiUrl}/workspace/${id}/locations`)
      .pipe(
        debounceTime(150),
        tap((locations) => {
          this.store.setEntities('locations', locations);
          this.store.setRelation(
            'workspacesLocations',
            id,
            locations.map((location) => location.id)
          );
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.translate.translate('location.get.error'));
          return of([]);
        })
      );
  }

  public getById(id: string): Observable<Location | null> {
    if (this.store.locations().has(id)) return of(null);

    return this.http.get<Location>(`${environment.apiUrl}/location/${id}`).pipe(
      debounceTime(150),
      tap((location) => this.store.setEntity('locations', location)),
      catchError((err) => {
        console.error(err);
        this.sonner.error(this.translate.translate('location.get.error'));
        return of(null);
      })
    );
  }

  public createLocation(workspaceId: string, req: LocationRequest) {
    return this.http
      .post<Location>(`${environment.apiUrl}/location`, {
        ...req,
        workspaceId: workspaceId,
      })
      .pipe(
        debounceTime(150),
        map((location) => {
          this.store.setEntity('locations', location);
          this.store.addToRelation(
            'workspacesLocations',
            workspaceId,
            location.id
          );
          this.sonner.success(
            this.translate.translate('location.create.success')
          );
          return true;
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.translate.translate('location.create.error'));
          return of(false);
        })
      );
  }

  public updateLocation(id: string, req: LocationRequest): Observable<boolean> {
    return this.http
      .put<Location>(`${environment.apiUrl}/location/${id}`, req)
      .pipe(
        debounceTime(150),
        map((location) => {
          this.store.setEntity('locations', location);
          this.store.addToRelation(
            'workspacesLocations',
            location.workspaceId,
            location.id
          );
          this.sonner.success(
            this.translate.translate('location.update.success')
          );
          return true;
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.translate.translate('location.update.error'));
          return of(false);
        })
      );
  }
}
