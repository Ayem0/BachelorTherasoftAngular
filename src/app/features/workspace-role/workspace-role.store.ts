import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Observable, of, tap } from 'rxjs';
import { WorkspaceRole } from './workspace-role';
import { WorkspaceRoleService } from './workspace-role.service';

type WorkspaceRoleState = {
    workspaceRoles: Map<string, WorkspaceRole>; // string is id
    workspaceRoleIdsByWorkspaceId: Map<string, string[]>; // string id workspaceId string[] is workspacerole ids
    loading: boolean;
    updating: boolean;
    creating: boolean;
    error: string | null;
}

const initialWorkspaceRoleState: WorkspaceRoleState = {
    workspaceRoles: new Map(),
    workspaceRoleIdsByWorkspaceId: new Map(),
    loading: false,
    creating: false,
    updating: false,
    error: null
};

export const WorkspaceRoleStore = signalStore(
    { providedIn: "root" },
    withState(initialWorkspaceRoleState),
    withMethods((store, workspaceRoleService = inject(WorkspaceRoleService)) => ({

        getWorkspaceRolesByWorkspaceId(workspaceId: string) : Observable<WorkspaceRole[]> {
            patchState(store, { loading: true });
            if (store.workspaceRoleIdsByWorkspaceId().has(workspaceId)) {
                const ids = store.workspaceRoleIdsByWorkspaceId().get(workspaceId)!;
                patchState(store, { loading: false });
                return of(ids.map(id => store.workspaceRoles().get(id)!));
            }
            return workspaceRoleService.getWorkspaceRolesByWorkspaceId(workspaceId).pipe(
                tap({
                    next: (workspaceRoles) => {
                        const updatedWorkspaceRoleIdsByWorkspaceId = new Map(store.workspaceRoleIdsByWorkspaceId());
                        updatedWorkspaceRoleIdsByWorkspaceId.set(workspaceId, workspaceRoles.map(wr => wr.id));
                        const updatedWorkspaceRoles = new Map(store.workspaceRoles());
                        workspaceRoles.forEach(x => updatedWorkspaceRoles.set(x.id, x));
                        patchState(store, {
                            workspaceRoles: updatedWorkspaceRoles,
                            workspaceRoleIdsByWorkspaceId: updatedWorkspaceRoleIdsByWorkspaceId,
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
                        const updatedWorkspaceRoles = new Map(store.workspaceRoles());
                        updatedWorkspaceRoles.set(newWorkspaceRole.id, newWorkspaceRole);
                        let updatedworkspaceRoleIdsByWorkspaceId : Map<string, string[]> | null = null;
                        if (store.workspaceRoleIdsByWorkspaceId().has(workspaceId)) {
                            updatedworkspaceRoleIdsByWorkspaceId = new Map(store.workspaceRoleIdsByWorkspaceId());
                            updatedworkspaceRoleIdsByWorkspaceId.set(workspaceId, [...store.workspaceRoleIdsByWorkspaceId().get(workspaceId)!, newWorkspaceRole.id]);
                        } 
                        patchState(store, {
                            workspaceRoles: updatedWorkspaceRoles,
                            workspaceRoleIdsByWorkspaceId: updatedworkspaceRoleIdsByWorkspaceId ?? store.workspaceRoleIdsByWorkspaceId(),
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
            id: string, 
            name: string,
            description?: string,
        ) {
            patchState(store, { updating: true })
            return workspaceRoleService.updateWorkspaceRole(id, name, description).pipe(
                tap({
                    next: (updatedWorkspaceRole) => {
                        const updatedWorkspaceRoles = new Map(store.workspaceRoles());
                        updatedWorkspaceRoles.set(updatedWorkspaceRole.id, updatedWorkspaceRole);
                        patchState(store, {
                            workspaceRoles: updatedWorkspaceRoles,
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