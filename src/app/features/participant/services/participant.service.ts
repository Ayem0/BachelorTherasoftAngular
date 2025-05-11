import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Id } from '../../../shared/models/entity';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
import { TranslateService } from '../../../shared/services/translate/translate.service';
import { ParticipantCategory } from '../../participant-category/models/participant-category';
import { Workspace } from '../../workspace/models/workspace';
import {
  Participant,
  ParticipantRequest,
  UNKNOWN_PARTICIPANT,
} from '../models/participant';

@Injectable({
  providedIn: 'root',
})
export class ParticipantService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly sonner = inject(SonnerService);
  private readonly translate = inject(TranslateService);

  constructor() {}

  public participantsByWorkspaceId(id: Id): Signal<Participant[]> {
    return computed(() =>
      this.store.workspacesParticipants().has(id)
        ? Array.from(
            this.store.workspacesParticipants().get(id)!,
            (i) => this.store.participants().get(i) ?? UNKNOWN_PARTICIPANT
          )
        : []
    );
  }

  public participantById(
    id: Id | null | undefined
  ): Signal<Participant | undefined> {
    return computed(() => (id ? this.store.participants().get(id) : undefined));
  }

  public async getParticipantsByWorkspaceId(workspaceId: string) {
    if (this.store.workspacesParticipants().has(workspaceId)) {
      return;
    }
    await firstValueFrom(
      this.http
        .get<
          Participant<{
            participantCategory: ParticipantCategory;
          }>[]
        >(`${environment.apiUrl}/api/participant/workspace`, {
          params: { id: workspaceId, withCategory: true },
        })
        .pipe(
          tap({
            next: (participants) => {
              this.store.setEntities('participants', participants);
              this.store.setRelation(
                'workspacesParticipants',
                workspaceId,
                participants.map((p) => p.id)
              );
            },
            error: (err) => {
              console.error(err);
              this.sonner.error(
                this.translate.translate('participant.get.error')
              );
            },
          })
        )
    );
  }

  public async createParticipant(workspaceId: string, req: ParticipantRequest) {
    let isSuccess = true;
    await firstValueFrom(
      this.http
        .post<Participant<{ participantCategory: ParticipantCategory }>>(
          `${environment.apiUrl}/api/participant`,
          {
            workspaceId,
            ...req,
          }
        )
        .pipe(
          tap({
            next: (participant) => {
              this.store.setEntity('participants', participant);
              this.sonner.success(
                this.translate.translate('participant.create.success')
              );
            },
            error: (err) => {
              isSuccess = false;
              console.error(err);
              this.sonner.error(
                this.translate.translate('participant.create.error')
              );
            },
          })
        )
    );
    return isSuccess;
  }

  public async updateParticipant(id: Id, req: ParticipantRequest) {
    let isSuccess = true;
    await firstValueFrom(
      this.http
        .put<Participant<{ participantCategory: ParticipantCategory }>>(
          `${environment.apiUrl}/api/participant?id=${id}`,
          req
        )
        .pipe(
          tap({
            next: (participant) => {
              this.store.setEntity('participants', participant);
              this.sonner.success(
                this.translate.translate('participant.update.success')
              );
            },
            error: (err) => {
              isSuccess = false;
              console.error(err);
              this.sonner.error(
                this.translate.translate('participant.update.error')
              );
            },
          })
        )
    );
    return isSuccess;
  }

  public async getParticipantById(id: string) {
    await firstValueFrom(
      this.http
        .get<
          Participant<{
            partcipantCategory: ParticipantCategory;
            workspace: Workspace;
          }>
        >(`${environment.apiUrl}/api/participant/details?id=${id}`)
        .pipe(
          tap({
            next: (participant) => {
              this.store.setEntity('participants', participant);
            },
            error: (err) => {
              console.error(err);
              this.sonner.error(
                this.translate.translate('participant.get.error')
              );
            },
          })
        )
    );
  }
}
