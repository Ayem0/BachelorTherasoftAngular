import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { catchError, debounceTime, map, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Id } from '../../../shared/models/entity';
import { LocaleService } from '../../../shared/services/locale/locale.service';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
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
  private readonly locale = inject(LocaleService);

  constructor() {}

  public participantsByWorkspaceId(id: Signal<Id>): Signal<Participant[]> {
    return computed(() =>
      this.store.workspacesParticipants().has(id())
        ? Array.from(
            this.store.workspacesParticipants().get(id())!,
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

  public getByWorkspaceId(id: string) {
    if (this.store.workspacesParticipants().has(id)) return of([]);
    return this.http
      .get<
        Participant<{
          participantCategory: ParticipantCategory;
        }>[]
      >(`${environment.apiUrl}/workspace/${id}/participants`)
      .pipe(
        debounceTime(150),
        tap((participants) => {
          this.store.setEntities('participants', participants);
          this.store.setRelation(
            'workspacesParticipants',
            id,
            participants.map((p) => p.id)
          );
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.locale.translate('participant.get.error'));
          return of([]);
        })
      );
  }

  public createParticipant(workspaceId: string, req: ParticipantRequest) {
    return this.http
      .post<Participant<{ participantCategory: ParticipantCategory }>>(
        `${environment.apiUrl}/participant`,
        {
          workspaceId,
          ...req,
        }
      )
      .pipe(
        debounceTime(150),
        map((participant) => {
          this.store.setEntity('participants', participant);
          this.store.addToRelation(
            'workspacesParticipants',
            workspaceId,
            participant.id
          );
          this.sonner.success(
            this.locale.translate('participant.create.success')
          );
          return true;
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.locale.translate('participant.create.error'));
          return of(false);
        })
      );
  }

  public updateParticipant(id: Id, req: ParticipantRequest) {
    return this.http
      .put<Participant<{ participantCategory: ParticipantCategory }>>(
        `${environment.apiUrl}/participant?id=${id}`,
        req
      )
      .pipe(
        debounceTime(150),
        map((participant) => {
          this.store.setEntity('participants', participant);
          this.sonner.success(
            this.locale.translate('participant.update.success')
          );
          return true;
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.locale.translate('participant.update.error'));
          return of(false);
        })
      );
  }

  public getById(id: string) {
    if (this.store.participants().has(id))
      return of(this.store.participants().get(id)!);
    return this.http
      .get<
        Participant<{
          partcipantCategory: ParticipantCategory;
          workspace: Workspace;
        }>
      >(`${environment.apiUrl}/participant/${id}`)
      .pipe(
        tap({
          next: (participant) => {
            this.store.setEntity('participants', participant);
          },
          error: (err) => {
            console.error(err);
            this.sonner.error(this.locale.translate('participant.get.error'));
          },
        })
      );
  }
}
