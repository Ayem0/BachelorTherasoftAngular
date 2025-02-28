import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import dayjs from 'dayjs';
import { environment } from '../../../environments/environment';
import { Slot, SlotRequest } from './slot';

@Injectable({
  providedIn: 'root',
})
export class SlotService {
  private readonly http = inject(HttpClient);
  constructor() {}

  public getSlotsByWorkspaceId(workspaceId: string) {
    return this.http.get<Slot[]>(`${environment.apiUrl}/api/slot/workspace`, {
      params: { workspaceId },
    });
  }

  public createSlot(workspaceId: string, req: SlotRequest) {
    const formatedStartTime =
      dayjs(req.startTime).format('HH:mm:ss.SSS') + '000';
    const formatedEndTime = dayjs(req.endTime).format('HH:mm:ss.SSS') + '000';
    const formatedStartDate = dayjs(req.startDate).format('YYYY-MM-DD');
    const formatedEndDate = dayjs(req.endDate).format('YYYY-MM-DD');
    return this.http.post<Slot>(`${environment.apiUrl}/api/slot`, {
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
    });
  }

  public updateSlot(id: string, slot: SlotRequest) {
    return this.http.put<Slot>(
      `${environment.apiUrl}/api/slot`,
      { slot },
      { params: { id: id } }
    );
  }
}
