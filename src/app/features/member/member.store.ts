import { computed, inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
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
import {
  updateModelMap,
  updateParentMap,
} from '../../shared/utils/store.utils';
import { Member } from './member';
import { MemberService } from './member.service';

type MemberState = {
  members: Map<string, Member>;
  memberIdsByWorkspaceId: Map<string, string[]>;
  selectedWorkspaceId: string;
  isLoading: boolean;
};

const initialMemberState: MemberState = {
  members: new Map(),
  memberIdsByWorkspaceId: new Map(),
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
    membersBySelectedWorkspace: computed(
      () =>
        new MatTableDataSource<Member, MatPaginator>(
          store.isLoading()
            ? []
            : store
                .memberIdsByWorkspaceId()
                .get(store.selectedWorkspaceId())!
                .map((x) => store.members().get(x)!)
        )
    ),
  })),
  withMethods((store, memberService = inject(MemberService)) => ({
    getMembersByWorkspaceId: rxMethod<string>(
      pipe(
        filter((id) => !store.memberIdsByWorkspaceId().has(id)),
        tap(() => patchState(store, { isLoading: true })),
        switchMap((id) =>
          memberService.getMembersByWorkspaceId(id).pipe(
            tap({
              next: (members) => {
                patchState(store, {
                  members: updateModelMap(store.members(), members),
                  memberIdsByWorkspaceId: updateParentMap(
                    store.memberIdsByWorkspaceId(),
                    id,
                    members
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
