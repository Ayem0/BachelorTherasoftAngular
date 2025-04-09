import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Id } from '../../../shared/models/entity';
import { StoreSlot } from '../models/slot';

type SlotState = {
  slots: Map<Id, StoreSlot>;
};

const initialSlotState: SlotState = {
  slots: new Map(),
};

export const SlotStore = signalStore(
  { providedIn: 'root' },
  withState(initialSlotState),
  withComputed((store) => ({
    slotsArr: computed(() => Array.from(store.slots().values())),
  })),
  withMethods((store) => ({
    setSlot(slot: StoreSlot) {
      patchState(store, {
        slots: new Map([...store.slots(), [slot.id, slot]]),
      });
    },
    setSlots(slots: StoreSlot[]) {
      const newSlots = new Map(store.slots());
      slots.forEach((slot) => {
        newSlots.set(slot.id, slot);
      });
      patchState(store, {
        slots: newSlots,
      });
    },
    deleteSlot(id: Id) {
      const newSlots = new Map(store.slots());
      newSlots.delete(id);
      patchState(store, {
        slots: newSlots,
      });
    },
  }))
);
