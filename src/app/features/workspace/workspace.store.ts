import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { of, tap } from 'rxjs';
import { Workspace, WorkspaceRequest } from './workspace';
import { WorkspaceService } from './workspace.service';

type WorkspaceState = {
  workspaces: Workspace[];
  loading: boolean;
  loaded: boolean;
  updating: boolean;
  creating: boolean;
  error: string | null;
};

const initialWorkspaceState: WorkspaceState = {
  workspaces: [],
  loading: false,
  loaded: false,
  creating: false,
  updating: false,
  error: null,
};

export const WorkspaceStore = signalStore(
  { providedIn: 'root' },
  withState(initialWorkspaceState),
  withMethods((store, workspaceService = inject(WorkspaceService)) => ({
    getWorkspaces() {
      if (store.loaded()) {
        return of(store.workspaces());
      }
      patchState(store, { loading: true });
      return workspaceService.getWorkspacesByUser().pipe(
        tap({
          next: (workspaces) => {
            patchState(store, {
              workspaces,
              loading: false,
              loaded: true,
              error: null,
            });
          },
          error: (error: Error) => {
            patchState(store, {
              loading: false,
              error: error.message,
            });
          },
        })
      );
    },

    getWorkspaceById(id: string) {
      patchState(store, { loading: true });
      if (store.loaded()) {
        return of(store.workspaces().find((x) => x.id === id)!);
      }
      return workspaceService.getWorkspaceById(id).pipe(
        tap({
          next: (newWorkspace) => {
            patchState(store, (state) => ({
              workspaces: [...state.workspaces, newWorkspace],
              creating: false,
              error: null,
            }));
          },
          error: (error: Error) => {
            patchState(store, { creating: false, error: error.message });
          },
        })
      );
    },

    createWorkspace(req: WorkspaceRequest) {
      patchState(store, { creating: true });
      return workspaceService.createWorkspace(req).pipe(
        tap({
          next: (newWorkspace) => {
            patchState(store, (state) => ({
              workspaces: [...state.workspaces, newWorkspace],
              creating: false,
              error: null,
            }));
          },
          error: (error: Error) => {
            patchState(store, { creating: false, error: error.message });
          },
        })
      );
    },

    updateWorkspace(id: string, req: WorkspaceRequest) {
      patchState(store, { updating: true });
      return workspaceService.updateWorkspace(id, req).pipe(
        tap({
          next: (updatedWorkspace) => {
            patchState(store, (state) => ({
              workspaces: state.workspaces.map((w) =>
                w.id === updatedWorkspace.id ? updatedWorkspace : w
              ),
              updating: false,
              error: null,
            }));
          },
          error: (error: Error) => {
            patchState(store, { updating: false, error: error.message });
          },
        })
      );
    },
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
