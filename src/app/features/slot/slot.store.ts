import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import { Slot, SlotRequest } from './slot';
import { SlotService } from './slot.service';

type SlotState = {
  slots: Map<string, Slot>; // string is id
  slotIdsByWorkspaceId: Map<string, string[]>;
  loading: boolean;
  updating: boolean;
  creating: boolean;
  error: string | null;
};

const initialSlotState: SlotState = {
  slotIdsByWorkspaceId: new Map(),
  slots: new Map(),
  loading: false,
  creating: false,
  updating: false,
  error: null,
};

export const SlotStore = signalStore(
  { providedIn: 'root' },
  withState(initialSlotState),
  withMethods((store, slotService = inject(SlotService)) => ({
    getSlotsByWorkspaceId(workspaceId: string): Observable<Slot[]> {
      patchState(store, { loading: true });
      if (store.slotIdsByWorkspaceId().has(workspaceId)) {
        const ids = store.slotIdsByWorkspaceId().get(workspaceId)!;
        patchState(store, { loading: false });
        return of(ids.map((x) => store.slots().get(x)!));
      }
      return slotService.getSlotsByWorkspaceId(workspaceId).pipe(
        tap({
          next: (slots) => {
            const updatedSlotIdsByWorkspaceId = new Map(
              store.slotIdsByWorkspaceId()
            );
            updatedSlotIdsByWorkspaceId.set(
              workspaceId,
              slots.map((wr) => wr.id)
            );
            const updatedSlots = new Map(store.slots());
            slots.forEach((x) => updatedSlots.set(x.id, x));
            patchState(store, {
              slots: updatedSlots,
              slotIdsByWorkspaceId: updatedSlotIdsByWorkspaceId,
              loading: false,
              error: null,
            });
          },
          error: (error: Error) => {
            patchState(store, {
              loading: false,
              error: error.message,
            });
          },
        })
      );
    },
    createSlot(workspaceId: string, req: SlotRequest) {
      patchState(store, { creating: true });
      return slotService.createSlot(workspaceId, req).pipe(
        tap({
          next: (newSlot) => {
            const updatedSlots = new Map(store.slots());
            updatedSlots.set(newSlot.id, newSlot);
            let updatedSlotIdsByWorkspaceId: Map<string, string[]> | null =
              null;
            if (store.slotIdsByWorkspaceId().has(workspaceId)) {
              updatedSlotIdsByWorkspaceId = new Map(
                store.slotIdsByWorkspaceId()
              );
              updatedSlotIdsByWorkspaceId.set(workspaceId, [
                ...store.slotIdsByWorkspaceId().get(workspaceId)!,
                newSlot.id,
              ]);
            }
            patchState(store, {
              slots: updatedSlots,
              slotIdsByWorkspaceId:
                updatedSlotIdsByWorkspaceId ?? store.slotIdsByWorkspaceId(),
              creating: false,
              error: null,
            });
          },
          error: (error: Error) => {
            patchState(store, { creating: false, error: error.message });
          },
        })
      );
    },
    updateSlot(id: string, slotRequest: SlotRequest) {
      patchState(store, { updating: true });
      return slotService.updateSlot(id, slotRequest).pipe(
        tap({
          next: (updatedslot) => {
            const updatedSlots = new Map(store.slots());
            updatedSlots.set(updatedslot.id, updatedslot);
            patchState(store, {
              slots: updatedSlots,
              updating: false,
              error: null,
            });
          },
          error: (error: Error) => {
            patchState(store, { updating: false, error: error.message });
          },
        })
      );
    },
  }))
);
