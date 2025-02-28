import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import {
  addModelToParentMap,
  updateModelMap,
  updateParentMap,
} from '../../shared/utils/store.utils';
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
            const updatedSlotIdsByWorkspaceId = updateParentMap(
              store.slotIdsByWorkspaceId(),
              workspaceId,
              slots
            );
            const updatedSlots = updateModelMap(store.slots(), slots);
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
            const updatedSlots = updateModelMap(store.slots(), [newSlot]);
            const updatedSlotIdsByWorkspaceId = addModelToParentMap(
              store.slotIdsByWorkspaceId(),
              workspaceId,
              newSlot
            );
            patchState(store, {
              slots: updatedSlots,
              slotIdsByWorkspaceId: updatedSlotIdsByWorkspaceId,
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
            const updatedSlots = updateModelMap(store.slots(), [updatedslot]);
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
