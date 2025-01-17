import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import { WorkspaceStore } from '../workspace/workspace.store';
import { WorkspaceRole } from './workspace-role';
import { WorkspaceRoleService } from './workspace-role.service';

type WorkspaceRoleState = {
    workspaceRoles: Map<string, WorkspaceRole[]>; // string is workspaceId
    loading: boolean;
    updating: boolean;
    creating: boolean;
    error: string | null;
}

const initialWorkspaceRoleState: WorkspaceRoleState = {
    workspaceRoles: new Map(),
    loading: false,
    creating: false,
    updating: false,
    error: null
};

export const WorkspaceRoleStore = signalStore(
    { providedIn: "root" },
    withState(initialWorkspaceRoleState),
    withMethods((store, workspaceRoleService = inject(WorkspaceRoleService), workspaceStore = inject(WorkspaceStore)) => ({
        getWorkspaceRolesByWorkspaceId(workspaceId: string) : Observable<WorkspaceRole[]> {
            patchState(store, { loading: true });
            if (store.workspaceRoles().has(workspaceId)) {
                console.log("la")
                patchState(store, { loading: false });
                return of(store.workspaceRoles().get(workspaceId)!);
            }
            console.log(workspaceStore.workspacesDetails().get(workspaceId))
            if (workspaceStore.workspacesDetails().has(workspaceId)) {
                console.log("ici")
                const workspaceRoles = workspaceStore.workspacesDetails().get(workspaceId)!.workspaceRoles;
                console.log(workspaceRoles)
                const updatedWorkspaceRoles = new Map(store.workspaceRoles());
                updatedWorkspaceRoles.set(workspaceId, workspaceRoles);
                patchState(store, {
                    workspaceRoles: updatedWorkspaceRoles,
                    loading: false,
                    error: null
                });
                return of(workspaceRoles);
            }
            return workspaceRoleService.getWorkspaceRolesByWorkspaceId(workspaceId).pipe(
                tap({
                    next: (workspaceRoles) => {
                        const updatedWorkspaceRoles = new Map(store.workspaceRoles());
                        updatedWorkspaceRoles.set(workspaceId, workspaceRoles);
                        patchState(store, {
                            workspaceRoles: updatedWorkspaceRoles,
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
        createWorkspaceRole(
            workspaceId: string, 
            name: string,
            description?: string,
        ) {
            patchState(store, { creating: true });
            return workspaceRoleService.createWorkspaceRole(workspaceId, name, description).pipe(
                tap({
                    next: (newWorkspaceRole) => {
                        patchState(store, {
                            workspaceRoles: store.workspaceRoles().set(workspaceId, store.workspaceRoles().has(workspaceId) 
                                ? [newWorkspaceRole, ...store.workspaceRoles().get(workspaceId)!]
                                : [newWorkspaceRole]),
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
        updateWorkspaceRole(
            workspaceId: string,
            id: string, 
            name: string,
            description?: string,
        ) {
            patchState(store, { updating: true })
            return workspaceRoleService.updateWorkspaceRole(id, name, description).pipe(
                tap({
                    next: (updatedWorkspaceRole) => {
                        patchState(store, {
                            workspaceRoles: store.workspaceRoles().set(workspaceId, store.workspaceRoles().has(workspaceId) 
                                ? store.workspaceRoles().get(workspaceId)!.map(WorkspaceRole => WorkspaceRole.id === updatedWorkspaceRole.id ? updatedWorkspaceRole : WorkspaceRole)
                                : [updatedWorkspaceRole]),
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