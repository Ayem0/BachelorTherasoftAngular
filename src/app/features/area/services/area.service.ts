import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Id } from '../../../shared/models/entity';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
import { TranslateService } from '../../../shared/services/translate/translate.service';
import { Area, AreaRequest, UNKNOW_AREA } from '../models/area';

@Injectable({
  providedIn: 'root',
})
export class AreaService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly sonner = inject(SonnerService);
  private readonly translate = inject(TranslateService);

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

  public async getById(id: string) {
    if (this.store.areas().has(id)) {
      return;
    }
    await firstValueFrom(
      this.http.get<Area>(`${environment.apiUrl}/api/area?id=${id}`).pipe(
        tap({
          next: (area) => {
            this.store.setEntity('areas', area);
          },
          error: (err) => {
            console.error('Error fetching area:', err);
            this.sonner.error(this.translate.translate('area.get.error'));
          },
        })
      )
    );
  }

  public async getAreasByLocationId(id: string) {
    if (this.store.locationsAreas().has(id)) {
      return;
    }
    await firstValueFrom(
      this.http
        .get<Area[]>(`${environment.apiUrl}/api/area/location?id=${id}`)
        .pipe(
          tap({
            next: (areas) => {
              this.store.setEntities('areas', areas);
              this.store.setRelation(
                'locationsAreas',
                id,
                areas.map((area) => area.id)
              );
            },
            error: (err) => {
              console.error('Error fetching areas:', err);
              this.sonner.error(this.translate.translate('area.get.error'));
            },
          })
        )
    );
  }

  public async createArea(locationId: string, req: AreaRequest) {
    let isSuccess = false;
    await firstValueFrom(
      this.http
        .post<Area>(`${environment.apiUrl}/api/area`, {
          locationId,
          ...req,
        })
        .pipe(
          tap({
            next: (area) => {
              this.store.setEntity('areas', area);
              this.store.addToRelation('locationsAreas', locationId, area.id);
              this.sonner.success(
                this.translate.translate('area.create.success')
              );
              isSuccess = true;
            },
            error: (err) => {
              console.error('Error creating area:', err);
              this.sonner.error(this.translate.translate('area.create.error'));
            },
          })
        )
    );
    return isSuccess;
  }

  public async updateArea(id: string, req: AreaRequest): Promise<boolean> {
    let isSuccess = false;
    await firstValueFrom(
      this.http.put<Area>(`${environment.apiUrl}/api/area?id=${id}`, req).pipe(
        tap({
          next: (area) => {
            this.store.setEntity('areas', area);
            this.store.addToRelation(
              'locationsAreas',
              area.locationId,
              area.id
            );
            this.sonner.success(
              this.translate.translate('area.update.success')
            );
            isSuccess = true;
          },
          error: (err) => {
            console.error('Error updating area:', err);
            this.sonner.error(this.translate.translate('area.update.error'));
          },
        })
      )
    );
    return isSuccess;
  }
}
