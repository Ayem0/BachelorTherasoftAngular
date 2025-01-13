
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { Workspace } from './workspace';
import { WorkspaceService } from './workspace.service';
import { delay, Observable, of, tap } from 'rxjs';

type WorkspaceState = {
  workspaces: Workspace[];
  workspacesDetails: Map<string, Workspace>;
  loading: boolean;
  loaded: boolean;
  updating: boolean;
  creating: boolean;
  error: string | null;
}

const initialWorkspaceState: WorkspaceState = {
  workspaces: [],
  workspacesDetails: new Map(),
  loading: false,
  loaded: false,
  creating: false,
  updating: false,
  error: null
};

export const WorkspaceStore = signalStore(
  { providedIn: "root" },
  withState(initialWorkspaceState),
  withMethods((store, workspaceService = inject(WorkspaceService)) => ({
    getWorkspaceDetailsById(workspaceId: string) : Observable<Workspace> {
      if (store.workspacesDetails().has(workspaceId)) {
        return of(store.workspacesDetails().get(workspaceId)!);
      }
      patchState(store, { loading: true });
      return workspaceService.getWorkspaceDetailsById(workspaceId).pipe(
        tap({
          next: (workspace) => {
            const updatedWorkspacesDetails = new Map(store.workspacesDetails());
            updatedWorkspacesDetails.set(workspaceId, workspace);
            patchState(store, {
              workspacesDetails: updatedWorkspacesDetails,
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
    getWorkspaces() {
      if (store.loaded()) {
        return of(store.workspaces());
      }
      patchState(store, { loading: true });
      return workspaceService.getWorkspaceByUserId().pipe(
        tap({
          next: (workspaces) => {
            patchState(store, {
              workspaces,
              loading: false,
              loaded: true,
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
    createWorkspace(name: string, description?: string) {
      patchState(store, { creating: true });
      return workspaceService.createWorkspace(name, description).pipe(
        tap({
          next: (newWorkspace) => {
            patchState(store, state => ({
              workspaces: [...state.workspaces, newWorkspace],
              creating: false,
              error: null
            }));
          },
          error: (error: Error) => {
            patchState(store, { creating: false, error: error.message });
          }
        })
      )
    },
    updateWorkspace(id: string, name: string, description?: string) {
      patchState(store, { updating: true })
      return workspaceService.updateWorkspace(id, name, description).pipe(
        tap({
          next: (updatedWorkspace) => {
            patchState(store, state => ({
              workspaces: state.workspaces.map(w =>
                w.id === updatedWorkspace.id ? updatedWorkspace : w
              ),
              updating: false,
              error: null
            }));
          },
          error: (error: Error) => {
            patchState(store, { updating: false, error: error.message });
          }
        })
      );
    }
    //   deleteWorkspace: rxMethod<string>(
    //     pipe(
    //       switchMap((workspaceId) => {
    //         return workspaceService.deleteWorkspace(workspaceId).pipe(
    //           tapResponse({
    //             next: () => {
    //               patchState(store, state => ({
    //                 workspaces: state.workspaces.filter(w => w.id !== workspaceId)
    //               }));
    //             },
    //             error: (error: Error) => {
    //               patchState(store, { error: error.message });
    //             }
    //           })
    //         );
    //       }),
    //       catchError(() => of())
    //     )
    //   )
  }))
);