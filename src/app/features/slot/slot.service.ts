import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Interval } from '../../shared/models/interval';
import { Slot } from './slot';

@Injectable({
  providedIn: 'root'
})
export class SlotService {
  private readonly http = inject(HttpClient);
  constructor() { }

  public getSlotsByWorkspaceId(workspaceId: string) {
    return this.http.get<Slot[]>(`${environment.apiUrl}/api/slot/workspace?workspaceId=${workspaceId}`);
  }

  public createSlot(
    workspaceId: string,
    name: string,
    startDate: Date | string,
    endDate: Date | string,
    startTime: Date | string,
    endTime: Date | string,
    eventCategoryIds: string[],
    description?: string,
    repetitionInterval?: Interval,
    repetitionNumber?: number,
    repetitionEndDate?: Date | string,
  ) {
    return this.http.post<Slot>(`${environment.apiUrl}/api/slot`, 
      { workspaceId, name, startDate, endDate, startTime, endTime, eventCategoryIds, description, repetitionInterval, repetitionNumber, repetitionEndDate }
    );
  }

  public updateSlot(
    id: string,
    name: string,
    startDate: Date | string,
    endDate: Date | string,
    startTime: Date | string,
    endTime: Date | string,
    eventCategoryIds: string[],
    description?: string,
    repetitionInterval?: Interval,
    repetitionNumber?: number,
    repetitionEndDate?: Date | string,
  ) {
    return this.http.put<Slot>(`${environment.apiUrl}/api/slot?`, 
      { id, name, startDate, endDate, startTime, endTime, eventCategoryIds, description, repetitionInterval, repetitionNumber, repetitionEndDate }, { params: { id: id } })
  }

  public getSlotDetailsById(id: string) {
    return this.http.get<Slot>(`${environment.apiUrl}/api/slot/details`, { params: { id: id } });
  }
}
