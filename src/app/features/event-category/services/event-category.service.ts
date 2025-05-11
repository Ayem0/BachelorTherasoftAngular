import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
import { TranslateService } from '../../../shared/services/translate/translate.service';
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
  private readonly translate = inject(TranslateService);

  public eventCategoriesByWorkspaceId(id: string) {
    return computed(() =>
      this.store.workspacesEventCategories().has(id)
        ? Array.from(
            this.store.workspacesEventCategories().get(id)!,
            (i) => this.store.eventCategories().get(i) ?? UNKNOWN_EVENT_CATEGORY
          )
        : []
    );
  }

  public eventCategoryById(id: string | null | undefined) {
    return computed(() =>
      id ? this.store.eventCategories().get(id) : undefined
    );
  }

  public async getEventCategoriesByWorkspaceId(id: string): Promise<void> {
    if (this.store.workspacesEventCategories().has(id)) {
      return;
    }
    await firstValueFrom(
      this.http
        .get<EventCategory[]>(
          `${environment.apiUrl}/api/EventCategory/workspace?id=${id}`
        )
        .pipe(
          tap({
            next: (eventCategories) => {
              this.store.setEntities('eventCategories', eventCategories);
              this.store.setRelation(
                'workspacesEventCategories',
                id,
                eventCategories.map((eventCategory) => eventCategory.id)
              );
            },
            error: (err) => {
              console.log(err);
              this.sonner.error(
                this.translate.translate('eventCategory.get.error')
              );
            },
          })
        )
    );
  }

  public async createEventCategory(
    workspaceId: string,
    req: EventCategoryRequest
  ): Promise<boolean> {
    let isSuccess = true;
    await firstValueFrom(
      this.http
        .post<EventCategory>(`${environment.apiUrl}/api/EventCategory`, {
          workspaceId,
          ...req,
        })
        .pipe(
          tap({
            next: (eventCategory) => {
              this.store.setEntity('eventCategories', eventCategory);
              this.sonner.success(
                this.translate.translate('eventCategory.create.success')
              );
            },
            error: (err) => {
              console.log(err);
              isSuccess = false;
              this.sonner.error(
                this.translate.translate('eventCategory.create.error')
              );
            },
          })
        )
    );
    return isSuccess;
  }

  public async updateEventCategory(
    id: string,
    req: EventCategoryRequest
  ): Promise<boolean> {
    let isSuccess = true;
    await firstValueFrom(
      this.http
        .put<EventCategory>(
          `${environment.apiUrl}/api/EventCategory?id=${id}`,
          req
        )
        .pipe(
          tap({
            next: (eventCategory) => {
              this.store.setEntity('eventCategories', eventCategory);
              this.sonner.success(
                this.translate.translate('eventCategory.update.success')
              );
            },
            error: (err) => {
              console.log(err);
              isSuccess = false;
              this.sonner.error(
                this.translate.translate('eventCategory.update.error')
              );
            },
          })
        )
    );
    return isSuccess;
  }
}
