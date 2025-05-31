import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { catchError, debounceTime, map, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Id } from '../../../shared/models/entity';
import { LocaleService } from '../../../shared/services/locale/locale.service';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
import {
  ParticipantCategory,
  ParticipantCategoryRequest,
  UNKNOWN_PARTICIPANTCATEGORY,
} from '../models/participant-category';

@Injectable({
  providedIn: 'root',
})
export class ParticipantCategoryService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly sonner = inject(SonnerService);
  private readonly locale = inject(LocaleService);

  constructor() {}

  public participantCategoriesByWorkspaceId(
    id: Id
  ): Signal<ParticipantCategory[]> {
    return computed(() =>
      this.store.workspacesParticipantCategories().has(id)
        ? Array.from(
            this.store.workspacesParticipantCategories().get(id)!,
            (i) =>
              this.store.participantCategories().get(i) ??
              UNKNOWN_PARTICIPANTCATEGORY
          )
        : []
    );
  }

  public participantCategoryById(id: Id | null | undefined) {
    return computed(() =>
      id ? this.store.participantCategories().get(id) : undefined
    );
  }

  public getParticipantCategoriesByWorkspaceId(id: Id) {
    if (this.store.workspacesParticipantCategories().has(id)) return of([]);
    return this.http
      .get<ParticipantCategory[]>(
        `${environment.apiUrl}/workspace/${id}/participantCategories`
      )
      .pipe(
        debounceTime(150),
        tap((pc) => {
          this.store.setRelation(
            'workspacesParticipantCategories',
            id,
            pc.map((p) => p.id)
          );
          this.store.setEntities('participantCategories', pc);
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.locale.translate('participantCategory.get.error')
          );
          return of([]);
        })
      );
  }

  public createParticipantCategory(
    workspaceId: string,
    req: ParticipantCategoryRequest
  ) {
    return this.http
      .post<ParticipantCategory>(`${environment.apiUrl}/ParticipantCategory`, {
        workspaceId,
        ...req,
      })
      .pipe(
        debounceTime(150),
        map((pc) => {
          this.store.setEntity('participantCategories', pc);
          this.store.addToRelation(
            'workspacesParticipantCategories',
            workspaceId,
            pc.id
          );
          this.sonner.success(
            this.locale.translate('participantCategory.create.success')
          );
          return true;
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.locale.translate('participantCategory.create.error')
          );
          return of(false);
        })
      );
  }

  public updateParticipantCategory(
    id: string,
    req: ParticipantCategoryRequest
  ) {
    return this.http
      .put<ParticipantCategory>(
        `${environment.apiUrl}/ParticipantCategory/${id}`,
        req
      )
      .pipe(
        debounceTime(150),
        map((pc) => {
          this.store.setEntity('participantCategories', pc);
          this.sonner.success(
            this.locale.translate('participantCategory.update.success')
          );
          return true;
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.locale.translate('participantCategory.update.error')
          );
          return of(false);
        })
      );
  }

  public getParticipantCategoryById(id: string) {
    if (this.store.participantCategories().has(id))
      return of(this.store.participantCategories().get(id)!);
    return this.http
      .get<ParticipantCategory>(
        `${environment.apiUrl}/ParticipantCategory/${id}`
      )
      .pipe(
        debounceTime(150),
        tap((pc) => {
          this.store.setEntity('participantCategories', pc);
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.locale.translate('participantCategory.get.error')
          );
          return of(null);
        })
      );
  }
}
