import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Id } from '../../../shared/models/entity';
import { format } from '../../../shared/utils/date.utils';
import { Slot, SlotRequest } from '../models/slot';
import { SlotStore } from './slot.store2';

@Injectable({
  providedIn: 'root',
})
export class SlotService {
  private readonly http = inject(HttpClient);
  private readonly slotStore = inject(SlotStore);

  public selectedWorkspaceId = signal<Id | null>(null);
  public slotsBySelectedWorkspaceId = computed(() =>
    this.slotStore
      .slotsArr()
      .filter((slot) => slot.workspaceId === this.selectedWorkspaceId())
  );
  constructor() {}

  public async getSlotsByWorkspaceId(workspaceId: string) {
    await firstValueFrom(
      this.http
        .get<Slot[]>(`${environment.apiUrl}/api/slot/workspace`, {
          params: { workspaceId },
        })
        .pipe(
          tap({
            next: (slots) => {
              this.slotStore.setSlots(
                slots.map((slot) => ({ ...slot, workspaceId: workspaceId }))
              );
            },
          })
        )
    );
  }

  public async createSlot(workspaceId: string, req: SlotRequest) {
    const formatedStartTime = format(req.startTime, 'HH:mm:ss.SSS') + '000';
    const formatedEndTime = format(req.endTime, 'HH:mm:ss.SSS') + '000';
    const formatedStartDate = format(req.startDate, 'YYYY-MM-DD');
    const formatedEndDate = format(req.endDate, 'YYYY-MM-DD');
    let isSuccess = false;
    await firstValueFrom(
      this.http
        .post<Slot>(`${environment.apiUrl}/api/slot`, {
          workspaceId: workspaceId,
          name: req.name,
          startDate: formatedStartDate,
          endDate: formatedEndDate,
          startTime: formatedStartTime,
          endTime: formatedEndTime,
          eventCategoryIds: req.eventCategoryIds,
          description: req.description,
          repetitionInterval: req.repetitionInterval,
          repetitionNumber: req.repetitionNumber,
          repetitionEndDate: req.repetitionEndDate,
        })
        .pipe(
          tap({
            next: (slot) => {
              this.slotStore.setSlot({ ...slot, workspaceId: workspaceId });
              isSuccess = true;
            },
          })
        )
    );
    return isSuccess;
  }

  public async updateSlot(id: string, slot: SlotRequest) {
    let isSuccess = false;
    await firstValueFrom(
      this.http
        .put<Slot>(
          `${environment.apiUrl}/api/slot`,
          { slot },
          { params: { id: id } }
        )
        .pipe(
          tap({
            next: (slot) => {
              this.slotStore.setSlot({ ...slot, workspaceId: '' }); // TODO get workspace id
              isSuccess = true;
            },
          })
        )
    );
    return isSuccess;
  }
}
