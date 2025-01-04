
import { computed, inject } from '@angular/core';
import { WorkspaceService } from '../services/workspace.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap } from 'rxjs';
import { switchMap, of } from 'rxjs';
import { Workspace } from '../models/workspace';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

type WorkspaceState = {
  workspaces: Workspace[];
  loading: boolean;
  loaded: boolean;
  updating: boolean;
  creating: boolean;
  filter: { query: string, order: "asc" | "desc" }
  error: string | null;
}

const initialWorkspaceState: WorkspaceState = {
  workspaces: [],
  loading: false,
  loaded: false,
  creating: false,
  updating: false,
  filter: { query: "", order: "asc" },
  error: null
};

export const WorkspaceStore = signalStore(
  { providedIn: "root" },
  withState(initialWorkspaceState),
  withComputed(({ workspaces, filter }) => ({
    workspaceCount: computed(() => workspaces.length),
    sortedWorkspaces: computed(() => {
      const direction = filter.order() === 'asc' ? 1 : -1;

      return workspaces().sort((a, b) =>
        direction * a.name.localeCompare(b.name)
      );
    })
  })),
  withMethods((store, workspaceService = inject(WorkspaceService)) => ({
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
              creating: false
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
              updating: false
            }));
          },
          error: (error: Error) => {
            patchState(store, { updating: false, error: error.message });
          }
        })
      );
    },
    // createWorkspace: rxMethod<{ name: string, description?: string}>(
    //   pipe(
    //     switchMap(({name, description}) => {
    //       patchState(store, { creating: true })
    //       return workspaceService.createWorkspace(name, description).pipe(
    //         tap({
    //           next: (newWorkspace) => {
    //             patchState(store, state => ({
    //               workspaces: [...state.workspaces, newWorkspace],
    //               creating: false
    //             }));
    //           },
    //           error: (error: Error) => {
    //             patchState(store, { creating: false, error: error.message });
    //           }
    //         })
    //       );
    //     }),
    //     catchError(() => of())
    //   )
    // ),
    // createWorkspace: rxMethod<Workspace>(
    //   pipe(
    //     switchMap((workspace) => {
    //       patchState(store, { creating: true })
    //       return workspaceService.createWorkspace(workspace.name, workspace.description).pipe(
    //         tap({
    //           next: (newWorkspace) => {
    //             patchState(store, state => ({
    //               workspaces: [...state.workspaces, newWorkspace],
    //               creating: false
    //             }));
    //           },
    //           error: (error: Error) => {
    //             patchState(store, { creating: false, error: error.message });
    //           }
    //         })
    //       );
    //     }),
    //     catchError(() => of())
    //   )
    // ),

    // updateWorkspace: rxMethod<Workspace>(
    //   pipe(
    //     switchMap((workspace) => {
    //       patchState(store, { updating: true })
    //       return workspaceService.updateWorkspace(workspace.id, workspace.name, workspace.description).pipe(
    //         tap({
    //           next: (updatedWorkspace) => {
    //             patchState(store, state => ({
    //               workspaces: state.workspaces.map(w =>
    //                 w.id === updatedWorkspace.id ? updatedWorkspace : w
    //               ),
    //               updating: false
    //             }));
    //           },
    //           error: (error: Error) => {
    //             patchState(store, { updating: false, error: error.message });
    //           }
    //         })
    //       );
    //     }),
    //     catchError(() => of())
    //   )
    // ),

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