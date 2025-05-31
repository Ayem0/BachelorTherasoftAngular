import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { catchError, debounceTime, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Id } from '../../../shared/models/entity';
import { LocaleService } from '../../../shared/services/locale/locale.service';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
import { Area, AreaRequest, UNKNOW_AREA } from '../models/area';

@Injectable({
  providedIn: 'root',
})
export class AreaService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly sonner = inject(SonnerService);
  private readonly locale = inject(LocaleService);

  public areaById(id: Id | undefined | null): Signal<Area | undefined> {
    return computed(() => (id ? this.store.areas().get(id) : undefined));
  }

  public areasByLocationId(id: Signal<Id>): Signal<Area[]> {
    return computed(() =>
      this.store.locationsAreas().has(id())
        ? Array.from(
            this.store.locationsAreas().get(id())!,
            (i) => this.store.areas().get(i) ?? UNKNOW_AREA
          )
        : []
    );
  }

  public getById(id: string): Observable<Area | null> {
    if (this.store.areas().has(id)) return of(null);
    return this.http.get<Area>(`${environment.apiUrl}/area/${id}`).pipe(
      debounceTime(150),
      tap((area) => this.store.setEntity('areas', area)),
      catchError((err) => {
        console.error('Error fetching area:', err);
        this.sonner.error(this.locale.translate('area.get.error'));
        return of(null);
      })
    );
  }

  public getAreasByLocationId(id: string): Observable<Area[]> {
    if (this.store.locationsAreas().has(id)) return of([]);
    return this.http
      .get<Area[]>(`${environment.apiUrl}/location/${id}/areas`)
      .pipe(
        debounceTime(150),
        tap((areas) => {
          this.store.setEntities('areas', areas);
          this.store.setRelation(
            'locationsAreas',
            id,
            areas.map((area) => area.id)
          );
        }),
        catchError((err) => {
          console.error('Error fetching areas:', err);
          this.sonner.error(this.locale.translate('area.get.error'));
          return of([]);
        })
      );
  }

  public createArea(locationId: string, req: AreaRequest): Observable<boolean> {
    return this.http
      .post<Area>(`${environment.apiUrl}/area`, {
        locationId,
        ...req,
      })
      .pipe(
        debounceTime(150),
        map((area) => {
          this.store.setEntity('areas', area);
          this.store.addToRelation('locationsAreas', locationId, area.id);
          this.sonner.success(this.locale.translate('area.create.success'));
          return true;
        }),
        catchError((err) => {
          console.error('Error creating area:', err);
          this.sonner.error(this.locale.translate('area.create.error'));
          return of(false);
        })
      );
  }

  public updateArea(id: string, req: AreaRequest): Observable<boolean> {
    return this.http.put<Area>(`${environment.apiUrl}/area/${id}`, req).pipe(
      debounceTime(150),
      map((area) => {
        this.store.setEntity('areas', area);
        this.store.addToRelation('locationsAreas', area.locationId, area.id);
        this.sonner.success(this.locale.translate('area.update.success'));
        return true;
      }),
      catchError((err) => {
        console.error('Error updating area:', err);
        this.sonner.error(this.locale.translate('area.update.error'));
        return of(false);
      })
    );
  }
}
