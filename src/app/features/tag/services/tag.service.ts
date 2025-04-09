import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Id } from '../../../shared/models/entity';
import { Tag, TagRequest } from '../models/tag';
import { TagStore } from './tag.store';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private readonly http = inject(HttpClient);
  private readonly tagStore = inject(TagStore);

  public selectedWorkspaceId = signal<Id | null>(null);
  public tagsBySelectedWorkspaceId = computed(() =>
    this.tagStore
      .tagsArr()
      .filter((tag) => tag.workspaceId === this.selectedWorkspaceId())
  );
  constructor() {}

  public async getTagsByWorkspaceId(workspaceId: string) {
    await firstValueFrom(
      this.http
        .get<Tag[]>(`${environment.apiUrl}/api/tag/workspace`, {
          params: { workspaceId },
        })
        .pipe(
          tap({
            next: (res) => {
              this.tagStore.setTags(
                res.map((tag) => ({ ...tag, workspaceId: workspaceId }))
              );
            },
            error: (err) => {
              console.log(err);
            },
          })
        )
    );
  }

  public async createTag(workspaceId: string, req: TagRequest) {
    let isSuccess = true;
    await firstValueFrom(
      this.http
        .post<Tag>(`${environment.apiUrl}/api/tag`, {
          workspaceId: workspaceId,
          name: req.name,
          color: req.color,
          icon: req.icon,
          description: req.description,
        })
        .pipe(
          tap({
            next: (tag) => {
              this.tagStore.setTag({ ...tag, workspaceId: workspaceId });
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

  public async updateTag(id: string, workspaceId: string, req: TagRequest) {
    let isSuccess = true;
    await firstValueFrom(
      this.http
        .put<Tag>(
          `${environment.apiUrl}/api/tag`,
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
            next: (tag) => {
              this.tagStore.setTag({ ...tag, workspaceId: workspaceId });
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

  public async getTagById(id: string, workspaceId: string) {
    await firstValueFrom(
      this.http
        .get<Tag>(`${environment.apiUrl}/api/tag/details`, {
          params: { id: id },
        })
        .pipe(
          tap({
            next: (tag) => {
              this.tagStore.setTag({ ...tag, workspaceId: workspaceId });
            },
            error: (err) => {
              console.log(err);
            },
          })
        )
    );
  }
}
