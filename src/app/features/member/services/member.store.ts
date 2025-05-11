import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Id } from '../../../shared/models/entity';
import { StoreMember } from '../models/member';

type MemberState = {
  members: Map<Id, StoreMember>;
  loadedWorkspaceIds: Set<string>;
};

const initialMemberState: MemberState = {
  members: new Map(),
  loadedWorkspaceIds: new Set(),
};

export const MemberStore = signalStore(
  { providedIn: 'root' },
  withState(initialMemberState),
  withComputed((store) => ({
    membersArr: computed(() => Array.from(store.members().values())),
  })),
  withMethods((store) => ({
    setLoadedWorkspaceId(id: Id) {
      patchState(store, {
        loadedWorkspaceIds: new Set([...store.loadedWorkspaceIds(), id]),
      });
    },
    setMember(m: StoreMember) {
      patchState(store, {
        members: new Map([...store.members(), [m.id, m]]),
      });
    },
    setMembers(ms: StoreMember[]) {
      const newMembers = new Map(store.members());
      ms.forEach((m) => {
        newMembers.set(m.id, m);
      });
      patchState(store, {
        members: newMembers,
      });
    },
    deleteMember(id: Id) {
      const newMembers = new Map(store.members());
      newMembers.delete(id);
      patchState(store, {
        members: newMembers,
      });
    },
  }))
);
