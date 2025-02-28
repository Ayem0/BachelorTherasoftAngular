import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import {
  addModelToParentMap,
  updateModelMap,
  updateParentMap,
} from '../../shared/utils/store.utils';
import { WorkspaceRole, WorkspaceRoleRequest } from './workspace-role';
import { WorkspaceRoleService } from './workspace-role.service';

type WorkspaceRoleState = {
  workspaceRoles: Map<string, WorkspaceRole>; // string is id
  workspaceRoleIdsByWorkspaceId: Map<string, string[]>; // string id workspaceId string[] is workspacerole ids
  loading: boolean;
  updating: boolean;
  creating: boolean;
};

const initialWorkspaceRoleState: WorkspaceRoleState = {
  workspaceRoles: new Map(),
  workspaceRoleIdsByWorkspaceId: new Map(),
  loading: false,
  creating: false,
  updating: false,
};

export const WorkspaceRoleStore = signalStore(
  { providedIn: 'root' },
  withState(initialWorkspaceRoleState),
  withMethods((store, workspaceRoleService = inject(WorkspaceRoleService)) => ({
    getWorkspaceRolesByWorkspaceId(
      workspaceId: string
    ): Observable<WorkspaceRole[]> {
      patchState(store, { loading: true });
      if (store.workspaceRoleIdsByWorkspaceId().has(workspaceId)) {
        const ids = store.workspaceRoleIdsByWorkspaceId().get(workspaceId)!;
        patchState(store, { loading: false });
        return of(ids.map((id) => store.workspaceRoles().get(id)!));
      }
      return workspaceRoleService
        .getWorkspaceRolesByWorkspaceId(workspaceId)
        .pipe(
          tap({
            next: (workspaceRoles) => {
              const updatedWorkspaceRoleIdsByWorkspaceId = updateParentMap(
                store.workspaceRoleIdsByWorkspaceId(),
                workspaceId,
                workspaceRoles
              );
              const updatedWorkspaceRoles = updateModelMap(
                store.workspaceRoles(),
                workspaceRoles
              );
              patchState(store, {
                workspaceRoles: updatedWorkspaceRoles,
                workspaceRoleIdsByWorkspaceId:
                  updatedWorkspaceRoleIdsByWorkspaceId,
                loading: false,
              });
            },
            error: (error: Error) => {
              patchState(store, {
                loading: false,
              });
            },
          })
        );
    },
    createWorkspaceRole(
      workspaceId: string,
      workspaceRoleRequest: WorkspaceRoleRequest
    ) {
      patchState(store, { creating: true });
      return workspaceRoleService
        .createWorkspaceRole(workspaceId, workspaceRoleRequest)
        .pipe(
          tap({
            next: (newWorkspaceRole) => {
              const updatedWorkspaceRoleIdsByWorkspaceId = addModelToParentMap(
                store.workspaceRoleIdsByWorkspaceId(),
                workspaceId,
                newWorkspaceRole
              );
              const updatedWorkspaceRoles = updateModelMap(
                store.workspaceRoles(),
                [newWorkspaceRole]
              );
              patchState(store, {
                workspaceRoles: updatedWorkspaceRoles,
                workspaceRoleIdsByWorkspaceId:
                  updatedWorkspaceRoleIdsByWorkspaceId,
                creating: false,
              });
            },
            error: (error: Error) => {
              patchState(store, { creating: false });
            },
          })
        );
    },
    updateWorkspaceRole(
      id: string,
      workspaceRoleRequest: WorkspaceRoleRequest
    ) {
      patchState(store, { updating: true });
      return workspaceRoleService
        .updateWorkspaceRole(id, workspaceRoleRequest)
        .pipe(
          tap({
            next: (updatedWorkspaceRole) => {
              const updatedWorkspaceRoles = updateModelMap(
                store.workspaceRoles(),
                [updatedWorkspaceRole]
              );
              patchState(store, {
                workspaceRoles: updatedWorkspaceRoles,
                updating: false,
              });
            },
            error: (error: Error) => {
              patchState(store, { updating: false });
            },
          })
        );
    },
  }))
);
