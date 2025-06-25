import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { catchError, debounceTime, map, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Id } from '../../../shared/models/entity';
import { DateService } from '../../../shared/services/date/date.service';
import { LocaleService } from '../../../shared/services/locale/locale.service';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store.service';
import { Slot, SlotRequest, UNKNOWN_SLOT } from '../models/slot';

@Injectable({
  providedIn: 'root',
})
export class SlotService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly sonner = inject(SonnerService);
  private readonly locale = inject(LocaleService);
  private readonly date = inject(DateService);

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

  public getSlotsByWorkspaceId(id: Id) {
    if (this.store.workspacesSlots().has(id)) return of([]);
    return this.http
      .get<Slot[]>(`${environment.apiUrl}/workspace/${id}/slots`)
      .pipe(
        debounceTime(150),
        tap((slots) => {
          this.store.setEntities('slots', slots);
          this.store.setRelation(
            'workspacesSlots',
            id,
            slots.map((s) => s.id)
          );
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.locale.translate('slot.get.error'));
          return of([]);
        })
      );
  }

  public createSlot(workspaceId: Id, req: SlotRequest) {
    const formatedStartTime =
      this.date.format(req.startTime, 'HH:mm:ss.SSS') + '000';
    const formatedEndTime =
      this.date.format(req.endTime, 'HH:mm:ss.SSS') + '000';
    const formatedStartDate = this.date.format(req.startDate, 'YYYY-MM-DD');
    const formatedEndDate = this.date.format(req.endDate, 'YYYY-MM-DD');
    return this.http
      .post<Slot>(`${environment.apiUrl}/slot`, {
        ...req,
        workspaceId: workspaceId,
        startDate: formatedStartDate,
        endDate: formatedEndDate,
        startTime: formatedStartTime,
        endTime: formatedEndTime,
      })
      .pipe(
        debounceTime(150),
        map((slot) => {
          this.store.setEntity('slots', slot);
          this.store.addToRelation('workspacesSlots', workspaceId, slot.id);
          this.sonner.success(this.locale.translate('slot.create.success'));
          return true;
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.locale.translate('slot.create.error'));
          return of(false);
        })
      );
  }

  public updateSlot(id: string, req: SlotRequest) {
    return this.http.put<Slot>(`${environment.apiUrl}/slot/${id}`, req).pipe(
      debounceTime(150),
      map((slot) => {
        this.store.setEntity('slots', slot);
        this.sonner.success(this.locale.translate('slot.update.success'));
        return true;
      }),
      catchError((err) => {
        console.error(err);
        this.sonner.error(this.locale.translate('slot.update.error'));
        return of(false);
      })
    );
  }

  // public async getSlotById(id: Id) {
  //   await firstValueFrom(
  //     this.http
  //       .get<Slot<{ eventCategories: EventCategory[]; rooms: Room[] }>>(
  //         `${environment.apiUrl}/slot?id=${id}`
  //       )
  //       .pipe(
  //         filter(() => !this.store.slots().has(id)),
  //         tap({
  //           next: (slot) => {
  //             this.store.setEntity('slots', slot);
  //             this.store.setEntities('eventCategories', slot.eventCategories);
  //             this.store.setEntities('rooms', slot.rooms);
  //           },
  //           error: (err) => {
  //             console.error(err);
  //             this.sonner.error(this.locale.translate('slot.get.error'));
  //           },
  //         })
  //       )
  //   );
  // }
}
