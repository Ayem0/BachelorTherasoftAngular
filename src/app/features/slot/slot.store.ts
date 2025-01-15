import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import { Interval } from '../../shared/models/interval';
import { WorkspaceStore } from '../workspace/workspace.store';
import { Slot } from './slot';
import { SlotService } from './slot.service';

type SlotState = {
    slots: Map<string, Slot[]>; // string is workspaceId
    loading: boolean;
    updating: boolean;
    creating: boolean;
    error: string | null;
}

const initialSlotState: SlotState = {
    slots: new Map(),
    loading: false,
    creating: false,
    updating: false,
    error: null
};

export const SlotStore = signalStore(
    { providedIn: "root" },
    withState(initialSlotState),
    withMethods((store, slotService = inject(SlotService), workspaceStore = inject(WorkspaceStore)) => ({
        getSlotsByWorkspaceId(workspaceId: string) : Observable<Slot[]> {
            patchState(store, { loading: true });
            if (store.slots().has(workspaceId)) {
                patchState(store, { loading: false });
                return of(store.slots().get(workspaceId)!);
            }
            if (workspaceStore.workspacesDetails().has(workspaceId)) {
                const slots = workspaceStore.workspacesDetails().get(workspaceId)!.slots;
                patchState(store, {
                    slots: store.slots().set(workspaceId, slots),
                    loading: false,
                    error: null
                });
                return of(slots);
            }
            return slotService.getSlotsByWorkspaceId(workspaceId).pipe(
                tap({
                    next: (slots) => {
                        patchState(store, {
                            slots: store.slots().set(workspaceId, slots),
                            loading: false,
                            error: null
                        });
                    },
                    error: (error: Error) => {
                        patchState(store, {
                            loading: false,
                            error: error.message
                        });
                    }
                })
            );
        },
        createSlot(
            workspaceId: string, 
            name: string,
            startDate: Date | string,
            startTime: Date | string,
            endDate: Date | string,
            endTime: Date | string,
            eventCategoryIds: string[],
            repetitionInterval?: Interval,
            repetitionNumber?: number,
            repetitionEndDate?: Date | string,
            description?: string,
        ) {
            patchState(store, { creating: true });
            return slotService.createSlot(
                workspaceId,
                name,
                startDate,
                endDate,
                startTime,
                endTime,
                eventCategoryIds,
                description,
                repetitionInterval,
                repetitionNumber,
                repetitionEndDate,
            ).pipe(
                tap({
                    next: (newslot) => {
                        patchState(store, {
                            slots: store.slots().set(workspaceId, store.slots().has(workspaceId) 
                                ? [newslot, ...store.slots().get(workspaceId)!]
                                : [newslot]),
                            creating: false,
                            error: null
                        });
                    },
                    error: (error: Error) => {
                        patchState(store, { creating: false, error: error.message });
                    }
                })
            )
        },
        updateSlot(
            workspaceId: string, 
            id: string, 
            name: string,
            startDate: Date | string,
            endDate: Date | string,
            startTime: Date | string,
            endTime: Date | string,
            eventCategoryIds: string[],
            repetitionInterval?: Interval,
            repetitionNumber?: number,
            repetitionEndDate?: Date | string,
            description?: string,
        ) {
            patchState(store, { updating: true })
            return slotService.updateSlot(
                id,
                name,
                startDate,
                endDate,
                startTime,
                endTime,
                eventCategoryIds,
                description,
                repetitionInterval,
                repetitionNumber,
                repetitionEndDate,
            ).pipe(
                tap({
                    next: (updatedslot) => {
                        patchState(store, {
                            slots: store.slots().set(workspaceId, store.slots().has(workspaceId) 
                                ? store.slots().get(workspaceId)!.map(slot => slot.id === updatedslot.id ? updatedslot : slot)
                                : [updatedslot]),
                            updating: false,
                            error: null
                        });
                    },
                    error: (error: Error) => {
                        patchState(store, { updating: false, error: error.message });
                    }
                })
            );
        }
    })
))