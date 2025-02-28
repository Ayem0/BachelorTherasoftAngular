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
import { User } from '../../../core/auth/models/auth';
import { AuthService } from '../../../core/auth/services/auth.service';
import { SocketService } from '../../../shared/services/socket/socket.service';
import {
  addModelToParentMap,
  removeModelToParentMap,
} from '../../../shared/utils/store.utils';
import { Invitation, InvitationType } from '../models/invitation.model';
import { InvitationService } from './invitation.service';

type InvitationState = {
  invitations: Invitation[];
  invitationIdsByWorkspaceId: Map<string, string[]>;
  selectedWorkspaceId: string;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isReceivedInvitationsLoaded: boolean;
  isPendingInvitationsLoaded: boolean;
};

const initialInvitationState: InvitationState = {
  invitations: [],
  invitationIdsByWorkspaceId: new Map(),
  selectedWorkspaceId: '',
  isLoading: false,
  isCreating: false,
  isReceivedInvitationsLoaded: false,
  isPendingInvitationsLoaded: false,
  isUpdating: false,
};

export const InvitationStore = signalStore(
  { providedIn: 'root' },
  withState(initialInvitationState),
  withHooks({
    onInit: (store, socket = inject(SocketService)) => {
      socket.onEvent<Invitation>('ContactInvitationReceived', (invitation) => {
        patchState(store, {
          invitations: [invitation, ...store.invitations()],
        });
      });

      socket.onEvent<User>('ContactInvitationAccepted', (contact) => {
        patchState(store, {
          invitations: store
            .invitations()
            .filter(
              (i) =>
                i.invitationType === InvitationType.Contact &&
                i.receiver.id !== contact.id
            ),
        });
      });

      socket.onEvent<string>('ContactInvitationCanceled', (id) => {
        patchState(store, {
          invitations: deleteInvitation(id, store.invitations()),
        });
      });

      socket.onEvent<Invitation>('ContactInvitationRefused', (invitation) => {
        patchState(store, {
          invitations: [invitation, ...store.invitations()],
        });
      });

      socket.onEvent<Invitation>(
        'WorkspaceInvitationReceived',
        (invitation) => {
          patchState(store, {
            invitations: [invitation, ...store.invitations()],
          });
        }
      );

      socket.onEvent<Invitation>('WorkspaceInvitationAdded', (invitation) => {
        patchState(store, {
          invitations: [invitation, ...store.invitations()],
        });
      });

      socket.onEvent<{ workspaceId: string; invitationId: string }>(
        'WorkspaceInvitationCanceled',
        ({ workspaceId, invitationId }) => {
          patchState(store, {
            invitationIdsByWorkspaceId: removeModelToParentMap(
              store.invitationIdsByWorkspaceId(),
              workspaceId,
              [invitationId]
            ),
            invitations: deleteInvitation(invitationId, store.invitations()),
          });
        }
      );

      socket.onEvent<{ workspaceId: string; invitationId: string }>(
        'WorkspaceInvitationRefused',
        ({ workspaceId, invitationId }) => {
          patchState(store, {
            invitationIdsByWorkspaceId: removeModelToParentMap(
              store.invitationIdsByWorkspaceId(),
              workspaceId,
              [invitationId]
            ),
            invitations: deleteInvitation(invitationId, store.invitations()),
          });
        }
      );
    },
  }),
  withComputed((store, authService = inject(AuthService)) => ({
    workspaceInvitationsSend: computed(() =>
      store
        .invitations()
        .filter((x) =>
          store
            .invitationIdsByWorkspaceId()
            .get(store.selectedWorkspaceId())
            ?.includes(x.id)
        )
    ),
    invitationsReceived: computed(() =>
      store
        .invitations()
        .filter((x) => x.receiver.id === authService.currentUserInfo()?.id)
    ),
    pendingContactInvitations: computed(() =>
      store
        .invitations()
        .filter(
          (x) =>
            x.invitationType === InvitationType.Contact &&
            x.sender.id === authService.currentUserInfo()?.id
        )
    ),
  })),
  withMethods(
    (
      store,
      invitationService = inject(InvitationService),
      authService = inject(AuthService)
    ) => ({
      getReceivedInvitations: rxMethod<void>(
        pipe(
          filter(() => !store.isReceivedInvitationsLoaded()),
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() =>
            invitationService.getReceivedInvitationsByUser().pipe(
              tap((invitations) => {
                patchState(store, {
                  invitations: invitations.map((invitation) => ({
                    ...invitation,
                    receiver: authService.currentUserInfo()!,
                  })),
                  isReceivedInvitationsLoaded: true,
                  isLoading: false,
                });
              })
            )
          )
        )
      ),

      getPendingInvitations: rxMethod<void>(
        pipe(
          filter(() => !store.isPendingInvitationsLoaded()),
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() =>
            invitationService.getPendingInvitationsByUser().pipe(
              tap((invitations) => {
                patchState(store, {
                  invitations: invitations.map((invitation) => ({
                    ...invitation,
                    sender: authService.currentUserInfo()!,
                  })),
                  isPendingInvitationsLoaded: true,
                  isLoading: false,
                });
              })
            )
          )
        )
      ),

      getInvitationsByWorkspaceId: rxMethod<string>(
        pipe(
          filter((id) => !store.invitationIdsByWorkspaceId().has(id)),
          tap(() => patchState(store, { isLoading: true })),
          switchMap((id) =>
            invitationService.getInvitationsByWorkspaceId(id).pipe(
              tap((res) => {
                patchState(store, {
                  invitations: res,
                  isLoading: false,
                });
              })
            )
          )
        )
      ),

      refuseWorkspaceInvitation: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isUpdating: true })),
          switchMap((id) =>
            invitationService.refuseWorkspaceInvitation(id).pipe(
              tap(() =>
                patchState(store, {
                  invitations: deleteInvitation(id, store.invitations()),
                  isUpdating: false,
                })
              )
            )
          )
        )
      ),

      acceptWorkspaceInvitation: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isUpdating: true })),
          switchMap((id) =>
            invitationService.acceptWorkspaceInvitation(id).pipe(
              tap(() =>
                patchState(store, {
                  invitations: deleteInvitation(id, store.invitations()),
                  isUpdating: false,
                })
              )
            )
          )
        )
      ),

      cancelWorkspaceInvitation: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isUpdating: true })),
          switchMap((id) =>
            invitationService.cancelWorkspaceInvitation(id).pipe(
              tap(() =>
                patchState(store, {
                  invitations: deleteInvitation(id, store.invitations()),
                  isUpdating: false,
                })
              )
            )
          )
        )
      ),

      createWorkspaceInvitation: rxMethod<[string, string]>(
        pipe(
          tap(() => patchState(store, { isUpdating: true })),
          switchMap(([workspaceId, receiverId]) =>
            invitationService
              .createWorkspaceInvitation(workspaceId, receiverId)
              .pipe(
                tap((invitation) =>
                  patchState(store, {
                    invitationIdsByWorkspaceId: addModelToParentMap(
                      store.invitationIdsByWorkspaceId(),
                      workspaceId,
                      invitation
                    ),
                    invitations: [invitation, ...store.invitations()],
                    isUpdating: false,
                  })
                )
              )
          )
        )
      ),

      refuseContactInvitation: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isUpdating: true })),
          switchMap((id) =>
            invitationService.refuseContactInvitation(id).pipe(
              tap(() =>
                patchState(store, {
                  invitations: deleteInvitation(id, store.invitations()),
                  isUpdating: false,
                })
              )
            )
          )
        )
      ),

      acceptContactInvitation: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isUpdating: true })),
          switchMap((id) =>
            invitationService.acceptContactInvitation(id).pipe(
              tap(() =>
                patchState(store, {
                  invitations: deleteInvitation(id, store.invitations()),
                  isUpdating: false,
                })
              )
            )
          )
        )
      ),

      cancelContactInvitation: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isUpdating: true })),
          switchMap((id) =>
            invitationService.cancelContactInvitation(id).pipe(
              tap(() =>
                patchState(store, {
                  invitations: deleteInvitation(id, store.invitations()),
                  isUpdating: false,
                })
              )
            )
          )
        )
      ),

      createContactInvitation: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isUpdating: true })),
          switchMap((contactEmail) =>
            invitationService.createContactInvitation(contactEmail).pipe(
              tap((invitation) =>
                patchState(store, {
                  invitations: [invitation, ...store.invitations()],
                  isUpdating: false,
                })
              )
            )
          )
        )
      ),
    })
  )
);

function deleteInvitation(id: string, array: Invitation[]) {
  return array.filter((x) => x.id !== id);
}
