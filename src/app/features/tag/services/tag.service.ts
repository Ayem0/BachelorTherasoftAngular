import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Id } from '../../../shared/models/entity';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
import { TranslateService } from '../../../shared/services/translate/translate.service';
import { Tag, TagRequest, UNKNOWN_TAG } from '../models/tag';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly sonner = inject(SonnerService);
  private readonly translate = inject(TranslateService);

  public tagsByWorkspaceId(id: Id): Signal<Tag[]> {
    return computed(() =>
      this.store.workspacesTags().has(id)
        ? Array.from(
            this.store.workspacesTags().get(id)!,
            (i) => this.store.tags().get(i) ?? UNKNOWN_TAG
          )
        : []
    );
  }

  public tagById(id: Id | null | undefined) {
    return computed(() => (id ? this.store.tags().get(id) : undefined));
  }

  public async getTagsByWorkspaceId(id: Id) {
    if (this.store.workspacesTags().has(id)) return;

    await firstValueFrom(
      this.http
        .get<Tag[]>(`${environment.apiUrl}/api/tag/workspace?id=${id}`)
        .pipe(
          tap({
            next: (tags) => {
              this.store.setEntities('tags', tags);
              this.store.setRelation(
                'workspacesTags',
                id,
                tags.map((t) => t.id)
              );
            },
            error: (err) => {
              console.log(err);
              this.sonner.error(this.translate.translate('tag.get.error'));
            },
          })
        )
    );
  }

  public async createTag(workspaceId: Id, req: TagRequest) {
    let isSuccess = true;
    await firstValueFrom(
      this.http
        .post<Tag>(`${environment.apiUrl}/api/tag`, {
          workspaceId: workspaceId,
          ...req,
        })
        .pipe(
          tap({
            next: (tag) => {
              this.store.setEntity('tags', tag);
              this.sonner.success(
                this.translate.translate('tag.create.success')
              );
            },
            error: (err) => {
              console.log(err);
              isSuccess = false;
              this.sonner.error(this.translate.translate('tag.create.error'));
            },
          })
        )
    );
    return isSuccess;
  }

  public async updateTag(id: Id, req: TagRequest) {
    let isSuccess = true;
    await firstValueFrom(
      this.http.put<Tag>(`${environment.apiUrl}/api/tag?id=${id}`, req).pipe(
        tap({
          next: (tag) => {
            this.store.setEntity('tags', tag);
            this.sonner.success(this.translate.translate('tag.update.success'));
          },
          error: (err) => {
            console.log(err);
            isSuccess = false;
            this.sonner.error(this.translate.translate('tag.update.error'));
          },
        })
      )
    );
    return isSuccess;
  }

  public async getTagById(id: Id) {
    if (this.store.tags().has(id)) return;

    await firstValueFrom(
      this.http.get<Tag>(`${environment.apiUrl}/api/tag?id=${id}`).pipe(
        tap({
          next: (tag) => {
            this.store.setEntity('tags', tag);
          },
          error: (err) => {
            console.log(err);
            this.sonner.error(this.translate.translate('tag.get.error'));
          },
        })
      )
    );
  }
}
