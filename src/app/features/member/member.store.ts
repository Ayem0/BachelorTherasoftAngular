import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { filter, pipe, switchMap, tap } from 'rxjs';
import { Member } from './member';
import { MemberService } from './member.service';

type MemberState = {
  members: Member[];
  loadedWorkspaceIds: Set<string>;
  selectedWorkspaceId: string;
  isLoading: boolean;
};

const initialMemberState: MemberState = {
  members: [],
  loadedWorkspaceIds: new Set(),
  selectedWorkspaceId: '',
  isLoading: true,
};

export const MemberStore = signalStore(
  { providedIn: 'root' },
  withState(initialMemberState),
  withHooks((store) => ({
    // TODO listen for socket events
  })),
  withComputed((store) => ({
    membersBySelectedWorkspaceId: computed(() =>
      store
        .members()
        .filter((member) => member.workspaceId === store.selectedWorkspaceId())
    ),
  })),
  withMethods((store, memberService = inject(MemberService)) => ({
    getMembersByWorkspaceId: rxMethod<void>(
      pipe(
        filter(
          () => !store.loadedWorkspaceIds().has(store.selectedWorkspaceId())
        ),
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          memberService
            .getMembersByWorkspaceId(store.selectedWorkspaceId())
            .pipe(
              tap({
                next: (members) => {
                  patchState(store, {
                    members: [...store.members(), ...members],
                    loadedWorkspaceIds: new Set(store.loadedWorkspaceIds()).add(
                      store.selectedWorkspaceId()
                    ),
                    isLoading: false,
                  });
                },
                error: (err) => {
                  console.error(err);
                  // TODO handle error
                  patchState(store, {
                    isLoading: false,
                  });
                },
              })
            )
        )
      )
    ),
    setSelectedWorkspaceId(id: string): void {
      patchState(store, {
        selectedWorkspaceId: id,
      });
    },
  }))
);
