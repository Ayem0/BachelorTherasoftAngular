import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Id } from '../../../shared/models/entity';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
import { TranslateService } from '../../../shared/services/translate/translate.service';
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
  private readonly translate = inject(TranslateService);

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

  public async getParticipantCategoriesByWorkspaceId(id: Id) {
    if (this.store.workspacesParticipants().has(id)) {
      return;
    }
    await firstValueFrom(
      this.http
        .get<ParticipantCategory[]>(
          `${environment.apiUrl}/api/ParticipantCategory/workspace?id=${id}`
        )
        .pipe(
          tap({
            next: (participantCategories) => {
              this.store.setRelation(
                'workspacesParticipantCategories',
                id,
                participantCategories.map((p) => p.id)
              );
              this.store.setEntities(
                'participantCategories',
                participantCategories
              );
            },
            error: (error) => {
              console.error(error);
              this.sonner.error(
                this.translate.translate('participantCategory.get.error')
              );
            },
          })
        )
    );
  }

  public async createParticipantCategory(
    workspaceId: string,
    req: ParticipantCategoryRequest
  ) {
    let isSuccess = true;
    await firstValueFrom(
      this.http
        .post<ParticipantCategory>(
          `${environment.apiUrl}/api/ParticipantCategory`,
          {
            workspaceId,
            ...req,
          }
        )
        .pipe(
          tap({
            next: (participantCategory) => {
              this.store.setEntity(
                'participantCategories',
                participantCategory
              );
              this.sonner.success(
                this.translate.translate('participantCategory.create.success')
              );
            },
            error: (error) => {
              console.error(error);
              isSuccess = false;
              this.sonner.error(
                this.translate.translate('participantCategory.create.error')
              );
            },
          })
        )
    );
    return isSuccess;
  }

  public async updateParticipantCategory(
    id: string,
    req: ParticipantCategoryRequest
  ) {
    let isSuccess = true;
    await firstValueFrom(
      this.http
        .put<ParticipantCategory>(
          `${environment.apiUrl}/api/ParticipantCategory`,
          req,
          { params: { id: id } }
        )
        .pipe(
          tap({
            next: (participantCategory) => {
              this.store.setEntity(
                'participantCategories',
                participantCategory
              );
              this.sonner.success(
                this.translate.translate('participantCategory.update.success')
              );
            },
            error: (error) => {
              console.error(error);
              isSuccess = false;
            },
          })
        )
    );
    return isSuccess;
  }

  public async getParticipantCategoryById(id: string) {
    await firstValueFrom(
      this.http
        .get<ParticipantCategory>(
          `${environment.apiUrl}/api/ParticipantCategory/details?id=${id}`
        )
        .pipe(
          tap({
            next: (participantCategory) => {
              this.store.setEntity(
                'participantCategories',
                participantCategory
              );
            },
            error: (error) => {
              console.error(error);
              this.sonner.error(
                this.translate.translate('participantCategory.get.error')
              );
            },
          })
        )
    );
  }
}
