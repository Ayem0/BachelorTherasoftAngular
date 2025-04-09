import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Id } from '../../../shared/models/entity';
import { StoreWorkspace } from '../models/workspace';

type WorkspaceState = {
  workspaces: Map<Id, StoreWorkspace>;
};

const initialWorkspaceState: WorkspaceState = {
  workspaces: new Map(),
};

export const WorkspaceStore = signalStore(
  { providedIn: 'root' },
  withState(initialWorkspaceState),
  withComputed((store) => ({
    workspacesArr: computed(() => Array.from(store.workspaces().values())),
  })),
  withMethods((store) => ({
    setWorkspaces(workspaces: StoreWorkspace[]) {
      const newWorkspaces = new Map(store.workspaces());
      workspaces.forEach((workspace) => {
        newWorkspaces.set(workspace.id, workspace);
      });
      patchState(store, {
        workspaces: newWorkspaces,
      });
    },
    setWorkspace(workspace: StoreWorkspace) {
      patchState(store, {
        workspaces: new Map([...store.workspaces(), [workspace.id, workspace]]),
      });
    },
    deleteWorkspace(workspace: StoreWorkspace) {
      const newWorkspaces = new Map(store.workspaces());
      newWorkspaces.delete(workspace.id);
      patchState(store, {
        workspaces: newWorkspaces,
      });
    },
  }))
);
