import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EventCategory, EventCategoryRequest } from '../models/event-category';
import { EventCategoryStore3 } from './event-category.store3';

@Injectable({
  providedIn: 'root',
})
export class EventCategoryService {
  private readonly http = inject(HttpClient);
  private readonly eventCategoryStore = inject(EventCategoryStore3);

  public selectedWorkspaceId = signal<string | null>(null);
  public eventCategoriesBySelectedWorkspaceId = computed(() =>
    this.eventCategoryStore
      .eventCategoriesArr()
      .filter(
        (eventCategory) =>
          eventCategory.workspaceId === this.selectedWorkspaceId()
      )
  );

  public async getEventCategoriesByWorkspaceId(workspaceId: string) {
    await firstValueFrom(
      this.http
        .get<EventCategory[]>(
          `${environment.apiUrl}/api/EventCategory/workspace`,
          { params: { workspaceId } }
        )
        .pipe(
          tap({
            next: (eventCategories) => {
              this.eventCategoryStore.setEventCategories(
                eventCategories.map((eventCategory) => ({
                  ...eventCategory,
                  workspaceId: workspaceId,
                }))
              );
            },
            error: (err) => {
              console.log(err);
            },
          })
        )
    );
  }

  public async createEventCategory(
    workspaceId: string,
    req: EventCategoryRequest
  ) {
    let isSuccess = true;
    await firstValueFrom(
      this.http
        .post<EventCategory>(`${environment.apiUrl}/api/EventCategory`, {
          workspaceId,
          name: req.name,
          color: req.color,
          icon: req.icon,
          description: req.description,
        })
        .pipe(
          tap({
            next: (eventCategory) => {
              this.eventCategoryStore.setEventCategory({
                ...eventCategory,
                workspaceId: workspaceId,
              });
            },
            error: (err) => {
              console.log(err);
              isSuccess = false;
            },
          })
        )
    );
    return isSuccess;
  }

  public async updateEventCategory(
    id: string,
    workspaceId: string,
    req: EventCategoryRequest
  ) {
    let isSuccess = true;
    await firstValueFrom(
      this.http
        .put<EventCategory>(
          `${environment.apiUrl}/api/EventCategory`,
          {
            name: req.name,
            color: req.color,
            icon: req.icon,
            description: req.description,
          },
          { params: { id: id } }
        )
        .pipe(
          tap({
            next: (eventCategory) => {
              this.eventCategoryStore.setEventCategory({
                ...eventCategory,
                workspaceId: workspaceId,
              });
            },
            error: (err) => {
              console.log(err);
              isSuccess = false;
            },
          })
        )
    );
    return isSuccess;
  }

  public async getEventCategoryDetailsById(id: string, workspaceId: string) {
    await firstValueFrom(
      this.http
        .get<EventCategory>(`${environment.apiUrl}/api/EventCategory/details`, {
          params: { id: id },
        })
        .pipe(
          tap({
            next: (eventCategory) => {
              this.eventCategoryStore.setEventCategory({
                ...eventCategory,
                workspaceId: workspaceId,
              });
            },
            error: (err) => {
              console.log(err);
            },
          })
        )
    );
  }
}
