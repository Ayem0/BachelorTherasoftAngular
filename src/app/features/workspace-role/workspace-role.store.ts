import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { filter, pipe, switchMap, tap } from 'rxjs';
import { WorkspaceRole, WorkspaceRoleRequest } from './workspace-role';
import { WorkspaceRoleService } from './workspace-role.service';

type WorkspaceRoleState = {
  workspaceRoles: WorkspaceRole[];
  selectedWorkspaceId: string;
  loadedWorkspaceIds: Set<string>;
  loading: boolean;
  updating: boolean;
  creating: boolean;
};

const initialWorkspaceRoleState: WorkspaceRoleState = {
  workspaceRoles: [],
  selectedWorkspaceId: '',
  loadedWorkspaceIds: new Set(),
  loading: false,
  creating: false,
  updating: false,
};

export const WorkspaceRoleStore = signalStore(
  { providedIn: 'root' },
  withState(initialWorkspaceRoleState),
  withComputed((store) => ({
    workspaceRolesBySelectedWorkspaceId: computed(() =>
      store
        .workspaceRoles()
        .filter(
          (workspaceRole) =>
            workspaceRole.workspaceId === store.selectedWorkspaceId()
        )
    ),

    // Add a loading state computed property for better UI feedback
    isLoading: computed(
      () => store.loading() || store.creating() || store.updating()
    ),
  })),
  withMethods((store, workspaceRoleService = inject(WorkspaceRoleService)) => ({
    setSelectedWorkspaceId(workspaceId: string) {
      patchState(store, { selectedWorkspaceId: workspaceId });
    },

    getWorkspaceRolesByWorkspaceId: rxMethod<void>(
      pipe(
        filter(
          () => !store.loadedWorkspaceIds().has(store.selectedWorkspaceId())
        ),
        switchMap(() =>
          workspaceRoleService
            .getWorkspaceRolesByWorkspaceId(store.selectedWorkspaceId())
            .pipe(
              tap({
                next: (workspaceRoles) => {
                  patchState(store, {
                    workspaceRoles: [
                      ...store.workspaceRoles(),
                      ...workspaceRoles,
                    ],
                    loadedWorkspaceIds: new Set([
                      ...store.loadedWorkspaceIds(),
                      store.selectedWorkspaceId(),
                    ]),
                  });
                },
                error: (error: Error) => {
                  console.error(error);
                  patchState(store, {
                    loading: false,
                  });
                },
              })
            )
        )
      )
    ),
    createWorkspaceRole(workspaceRoleRequest: WorkspaceRoleRequest) {
      patchState(store, { creating: true });
      return workspaceRoleService
        .createWorkspaceRole(store.selectedWorkspaceId(), workspaceRoleRequest)
        .pipe(
          tap({
            next: (newWorkspaceRole) => {
              patchState(store, {
                workspaceRoles: [...store.workspaceRoles(), newWorkspaceRole],
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
              patchState(store, {
                workspaceRoles: store
                  .workspaceRoles()
                  .map((workspaceRole) =>
                    workspaceRole.id === updatedWorkspaceRole.id
                      ? updatedWorkspaceRole
                      : workspaceRole
                  ),
                updating: false,
              });
            },
            error: (error: Error) => {
              console.error(error);
              patchState(store, { updating: false });
            },
          })
        );
    },
  }))
);
