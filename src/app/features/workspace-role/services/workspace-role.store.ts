import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Id } from '../../../shared/models/entity';
import { StoreWorkspaceRole } from '../models/workspace-role';

type WorkspaceRoleState = {
  workspaceRoles: Map<Id, StoreWorkspaceRole>;
  loadedWorkspaceIds: Set<Id>;
};

const initialWorkspaceRoleState: WorkspaceRoleState = {
  workspaceRoles: new Map(),
  loadedWorkspaceIds: new Set(),
};

export const WorkspaceRoleStore = signalStore(
  { providedIn: 'root' },
  withState(initialWorkspaceRoleState),
  withComputed((store) => ({
    workspaceRolesArr: computed(() =>
      Array.from(store.workspaceRoles().values())
    ),
  })),
  withMethods((store) => ({
    setLoadedWorkspaceId(id: Id) {
      patchState(store, {
        loadedWorkspaceIds: new Set([...store.loadedWorkspaceIds(), id]),
      });
    },
    setWorkspaceRole(wr: StoreWorkspaceRole) {
      patchState(store, {
        workspaceRoles: new Map([...store.workspaceRoles(), [wr.id, wr]]),
      });
    },
    setWorkspaceRoles(wrs: StoreWorkspaceRole[]) {
      const newWorkspaceRoles = new Map(store.workspaceRoles());
      wrs.forEach((wr) => {
        newWorkspaceRoles.set(wr.id, wr);
      });
      patchState(store, {
        workspaceRoles: newWorkspaceRoles,
      });
    },
    deleteWorkspaceRole(id: Id) {
      const newWorkspaceRoles = new Map(store.workspaceRoles());
      newWorkspaceRoles.delete(id);
      patchState(store, {
        workspaceRoles: newWorkspaceRoles,
      });
    },
  }))
);
