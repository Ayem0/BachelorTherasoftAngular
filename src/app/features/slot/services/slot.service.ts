import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { filter, firstValueFrom, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Id } from '../../../shared/models/entity';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
import { TranslateService } from '../../../shared/services/translate/translate.service';
import { format } from '../../../shared/utils/date.utils';
import { EventCategory } from '../../event-category/models/event-category';
import { Room } from '../../room/models/room';
import { Slot, SlotRequest, UNKNOWN_SLOT } from '../models/slot';

@Injectable({
  providedIn: 'root',
})
export class SlotService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly sonner = inject(SonnerService);
  private readonly translate = inject(TranslateService);

  public slotsByWorkspaceId(id: Id) {
    return computed(() =>
      this.store.workspacesSlots().has(id)
        ? Array.from(
            this.store.workspacesSlots().get(id)!,
            (i) => this.store.slots().get(i) ?? UNKNOWN_SLOT
          )
        : []
    );
  }

  public slotById(id: Id | null | undefined) {
    return computed(() => (id ? this.store.slots().get(id) : undefined));
  }

  // public slotWithEventCategoryById(id: Id | null | undefined) {
  //   return computed(() => {
  //     const slot = this.store.slotsJoinEventCategories().get(id!);
  //   });
  // }

  public async getSlotsByWorkspaceId(id: Id) {
    await firstValueFrom(
      this.http
        .get<Slot[]>(`${environment.apiUrl}/api/slot/workspace?id=${id}`)
        .pipe(
          tap({
            next: (slots) => {
              // this.store.setRelation('workspacesSlots', slots.map((slot) => slot.id));
              this.store.setEntities('slots', slots);
            },
            error: (err) => {
              console.error(err);
              this.sonner.error(this.translate.translate('slot.get.error'));
            },
          })
        )
    );
  }

  public async createSlot(workspaceId: Id, req: SlotRequest) {
    const formatedStartTime = format(req.startTime, 'HH:mm:ss.SSS') + '000';
    const formatedEndTime = format(req.endTime, 'HH:mm:ss.SSS') + '000';
    const formatedStartDate = format(req.startDate, 'YYYY-MM-DD');
    const formatedEndDate = format(req.endDate, 'YYYY-MM-DD');
    let isSuccess = true;
    await firstValueFrom(
      this.http
        .post<Slot>(`${environment.apiUrl}/api/slot`, {
          ...req,
          workspaceId: workspaceId,
          startDate: formatedStartDate,
          endDate: formatedEndDate,
          startTime: formatedStartTime,
          endTime: formatedEndTime,
        })
        .pipe(
          tap({
            next: (slot) => {
              this.store.setEntity('slots', slot);
              this.sonner.success(
                this.translate.translate('slot.create.success')
              );
            },
            error: (err) => {
              console.error(err);
              isSuccess = false;
              this.sonner.error(this.translate.translate('slot.create.error'));
            },
          })
        )
    );
    return isSuccess;
  }

  public async updateSlot(id: string, req: SlotRequest) {
    let isSuccess = true;
    await firstValueFrom(
      this.http.put<Slot>(`${environment.apiUrl}/api/slot?id=${id}`, req).pipe(
        tap({
          next: (slot) => {
            this.store.setEntity('slots', slot);
            this.sonner.success(
              this.translate.translate('slot.update.success')
            );
          },
          error: (err) => {
            console.error(err);
            isSuccess = false;
            this.sonner.error(this.translate.translate('slot.update.error'));
          },
        })
      )
    );
    return isSuccess;
  }

  public async getSlotById(id: Id) {
    await firstValueFrom(
      this.http
        .get<Slot<{ eventCategories: EventCategory[]; rooms: Room[] }>>(
          `${environment.apiUrl}/api/slot?id=${id}`
        )
        .pipe(
          filter(() => !this.store.slots().has(id)),
          tap({
            next: (slot) => {
              this.store.setEntity('slots', slot);
              this.store.setEntities('eventCategories', slot.eventCategories);
              this.store.setEntities('rooms', slot.rooms);
            },
            error: (err) => {
              console.error(err);
              this.sonner.error(this.translate.translate('slot.get.error'));
            },
          })
        )
    );
  }
}
