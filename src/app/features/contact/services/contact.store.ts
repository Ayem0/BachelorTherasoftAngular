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
import { SocketService } from '../../../shared/services/socket/socket.service';
import { ContactService } from './contact.service';

type ContactState = {
  contacts: User[];
  isLoading: boolean;
  isLoaded: boolean;
};

const initialContactState: ContactState = {
  contacts: [],
  isLoading: false,
  isLoaded: false,
};

export const ContactStore = signalStore(
  { providedIn: 'root' },
  withState(initialContactState),
  withHooks({
    onInit: (store, socket = inject(SocketService)) => {
      socket.onEvent<User>('ContactAdded', (contact) => {
        patchState(store, {
          contacts: [contact, ...store.contacts()],
        });
      });
      socket.onEvent<User>('ContactInvitationAccepted', (contact) => {
        patchState(store, {
          contacts: [contact, ...store.contacts()],
        });
      });
      socket.onEvent<string>('ContactRemoved', (id) => {
        patchState(store, {
          contacts: store.contacts().filter((c) => c.id !== id),
        });
      });
    },
  }),
  withComputed((store) => ({
    contactsCount: computed(() => store.contacts().length),
  })),
  withMethods((store, contactService = inject(ContactService)) => ({
    getContacts: rxMethod<void>(
      pipe(
        filter(() => !store.isLoaded()),
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          contactService.GetUserContacts().pipe(
            tap((contacts) => {
              patchState(store, {
                contacts: contacts,
                isLoaded: true,
                isLoading: false,
              });
            })
          )
        )
      )
    ),
  }))
);
