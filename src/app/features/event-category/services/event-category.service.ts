import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { catchError, debounceTime, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LocaleService } from '../../../shared/services/locale/locale.service';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
import {
  EventCategory,
  EventCategoryRequest,
  UNKNOWN_EVENT_CATEGORY,
} from '../models/event-category';

@Injectable({
  providedIn: 'root',
})
export class EventCategoryService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly sonner = inject(SonnerService);
  private readonly locale = inject(LocaleService);

  public eventCategoriesByWorkspaceId(
    id: Signal<string>
  ): Signal<EventCategory[]> {
    return computed(() => {
      if (!this.store.workspacesEventCategories().has(id())) return [];
      return Array.from(
        this.store.workspacesEventCategories().get(id())!,
        (i) => this.store.eventCategories().get(i) ?? UNKNOWN_EVENT_CATEGORY
      );
    });
  }

  public eventCategoryById(id: string | null | undefined) {
    return computed(() =>
      id ? this.store.eventCategories().get(id) : undefined
    );
  }

  public getEventCategoriesByWorkspaceId(
    id: string
  ): Observable<EventCategory[]> {
    if (this.store.workspacesEventCategories().has(id)) {
      return of([]);
    }
    return this.http
      .get<EventCategory[]>(
        `${environment.apiUrl}/workspace/${id}/eventCategories`
      )
      .pipe(
        debounceTime(150),
        tap((ecs) => {
          this.store.setEntities('eventCategories', ecs);
          this.store.setRelation(
            'workspacesEventCategories',
            id,
            ecs.map((eventCategory) => eventCategory.id)
          );
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.locale.translate('eventCategory.get.error'));
          return of([]);
        })
      );
  }

  public createEventCategory(
    workspaceId: string,
    req: EventCategoryRequest
  ): Observable<boolean> {
    return this.http
      .post<EventCategory>(`${environment.apiUrl}/EventCategory`, {
        workspaceId,
        ...req,
      })
      .pipe(
        debounceTime(150),
        map((ec) => {
          this.store.setEntity('eventCategories', ec);
          this.store.addToRelation(
            'workspacesEventCategories',
            workspaceId,
            ec.id
          );
          this.sonner.success(
            this.locale.translate('eventCategory.create.success')
          );
          return true;
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.locale.translate('eventCategory.create.error')
          );
          return of(false);
        })
      );
  }

  public updateEventCategory(
    id: string,
    req: EventCategoryRequest
  ): Observable<boolean> {
    return this.http
      .put<EventCategory>(`${environment.apiUrl}/EventCategory/${id}`, req)
      .pipe(
        debounceTime(150),
        map((ec) => {
          this.store.setEntity('eventCategories', ec);
          this.sonner.success(
            this.locale.translate('eventCategory.update.success')
          );
          return true;
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(
            this.locale.translate('eventCategory.update.error')
          );
          return of(false);
        })
      );
  }
}
