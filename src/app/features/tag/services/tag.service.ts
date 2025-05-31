import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { catchError, debounceTime, map, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Id } from '../../../shared/models/entity';
import { LocaleService } from '../../../shared/services/locale/locale.service';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
import { Tag, TagRequest, UNKNOWN_TAG } from '../models/tag';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly sonner = inject(SonnerService);
  private readonly locale = inject(LocaleService);

  public tagsByWorkspaceId(id: Signal<string>): Signal<Tag[]> {
    return computed(() => {
      if (!this.store.workspacesTags().has(id())) return [];
      return Array.from(
        this.store.workspacesTags().get(id())!,
        (i) => this.store.tags().get(i) ?? UNKNOWN_TAG
      );
    });
  }

  public tagById(id: Id | null | undefined) {
    return computed(() => (id ? this.store.tags().get(id) : undefined));
  }

  public getTagsByWorkspaceId(id: Id) {
    if (this.store.workspacesTags().has(id)) return of([]);

    return this.http
      .get<Tag[]>(`${environment.apiUrl}/workspace/${id}/tags`)
      .pipe(
        debounceTime(150),
        tap((tags) => {
          this.store.setEntities('tags', tags);
          this.store.setRelation(
            'workspacesTags',
            id,
            tags.map((w) => w.id)
          );
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.locale.translate('tag.get.error'));
          return of([]);
        })
      );
  }

  public createTag(workspaceId: Id, req: TagRequest) {
    return this.http
      .post<Tag>(`${environment.apiUrl}/tag`, {
        workspaceId: workspaceId,
        ...req,
      })
      .pipe(
        debounceTime(150),
        map((tag) => {
          this.store.setEntity('tags', tag);
          this.store.addToRelation('workspacesTags', workspaceId, tag.id);
          this.sonner.success(this.locale.translate('tag.create.success'));
          return true;
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.locale.translate('tag.create.error'));
          return of(false);
        })
      );
  }

  public updateTag(id: Id, req: TagRequest) {
    return this.http.put<Tag>(`${environment.apiUrl}/tag/${id}`, req).pipe(
      debounceTime(150),
      map((tag) => {
        this.store.setEntity('tags', tag);
        this.sonner.success(this.locale.translate('tag.update.success'));
        return true;
      }),
      catchError((err) => {
        console.error(err);
        this.sonner.error(this.locale.translate('tag.update.error'));
        return of(false);
      })
    );
  }

  public getTagById(id: Id) {
    if (this.store.tags().has(id)) return of(this.store.tags().get(id)!);

    return this.http.get<Tag>(`${environment.apiUrl}/tag/${id}`).pipe(
      debounceTime(150),
      tap((tag) => this.store.setEntity('tags', tag)),
      catchError((err) => {
        console.error(err);
        this.sonner.error(this.locale.translate('workspaceRole.get.error'));
        return of(null);
      })
    );
  }
}
