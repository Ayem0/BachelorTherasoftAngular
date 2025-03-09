import { computed, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { filter, of, pipe, switchMap, tap } from 'rxjs';
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
  withComputed((store) => ({
    workspaceDataSource: computed(
      () => new MatTableDataSource(store.loading() ? [] : store.workspaces())
    ),
  })),
  withMethods((store, workspaceService = inject(WorkspaceService)) => ({
    getWorkspaces: rxMethod<void>(
      pipe(
        filter(() => !store.loaded()),
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          workspaceService.getWorkspacesByUser().pipe(
            tap({
              next: (workspaces) => {
                patchState(store, {
                  loaded: true,
                  loading: false,
                  workspaces: workspaces,
                });
              },
              error: (err) => {
                console.log(err);
                patchState(store, {
                  loading: false,
                });
              },
            })
          )
        )
      )
    ),

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
  }))
);
