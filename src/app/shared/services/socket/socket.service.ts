import { inject, Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/auth/models/auth';
import {
  ContactInvitation,
  InvitationType,
  WorkspaceInvitation,
} from '../../../features/invitation/models/invitation.model';
import { Workspace } from '../../../features/workspace/models/workspace';
import { Store } from '../store/store';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private connection: signalR.HubConnection = new signalR.HubConnectionBuilder()
    .withUrl(`${environment.apiUrl}/hub`)
    .withAutomaticReconnect()
    .build();
  private readonly store = inject(Store);
  private currentUserId = '';

  public async startConnection(currentUserId: string) {
    this.currentUserId = currentUserId;
    await this.connection.start();
    console.log('Socket connection started');
    this.connection.onclose(() => {
      console.log('Socket connection closed');
    });
    this.connection.onreconnected(() => {
      console.log('Socket connection reestablished');
    });
    this.connection.onreconnecting(() => {
      console.log('Socket connection lost, reconnecting...');
    });
    this.listenForEvents();
  }

  private onEvent<T>(eventName: string, callback: (data: T) => void): void {
    this.connection.on(eventName, callback);
  }

  public async endConnection() {
    await this.connection.stop();
  }

  private listenForEvents() {
    this.listenForContactEvents();
    this.listenForWorkspaceEvents();
    this.listenForAreaEvents();
    this.listenForRoomEvents();
    this.listenForEventEvents();
    this.listenForEventCategoryEvents();
    this.listenForParticipantEvents();
    this.listenForParticipantCategoryEvents();
    this.listenForSlotEvents();
    this.listenForTagEvents();
    this.listenForLocationEvents();
    this.listenForMemberEvents();
    this.listenForWorkspaceRoleEvents();
    this.listenForInvitationEvents();
  }

  private listenForContactEvents() {
    this.onEvent<User>('ContactAdded', (contact) => {
      this.store.setEntity('users', contact);
      this.store.addToRelation('usersContacts', this.currentUserId, contact.id);
    });
    this.onEvent<string>('ContactRemoved', (id) => {
      this.store.deleteFromRelation('usersContacts', this.currentUserId, id);
    });
  }

  private listenForInvitationEvents() {
    this.listenForContactInvitationEvents();
    this.listenForWorkspaceInvitationEvents();
  }

  private listenForWorkspaceInvitationEvents() {
    this.onEvent<
      WorkspaceInvitation<{
        receiver: User;
        sender: User;
        workspace: Workspace;
      }>
    >('WorkspaceInvitationCreated', (invitation) => {
      this.store.setEntity('invitations', invitation);
      this.store.setEntity('workspaces', invitation.workspace);
      this.store.setEntity('users', invitation.receiver);
      this.store.setEntity('users', invitation.sender);
      this.store.addToRelation(
        'usersReceivedInvitations',
        invitation.receiver.id,
        invitation.id
      );
      this.store.addToRelation(
        'workspacesInvitations',
        invitation.workspace.id,
        invitation.id
      );
    });

    this.onEvent<string>('WorkspaceInvitationDeleted', (id) => {
      const invitation = this.store.invitations().get(id);
      if (
        invitation &&
        invitation.invitationType === InvitationType.Workspace
      ) {
        this.store.deleteEntity('invitations', id);
        this.store.deleteFromRelation(
          'workspacesInvitations',
          (invitation as WorkspaceInvitation).workspaceId,
          id
        );
        this.store.deleteFromRelation(
          'usersReceivedInvitations',
          invitation.receiverId,
          id
        );
      }
    });
  }

  private listenForContactInvitationEvents() {
    this.onEvent<ContactInvitation<{ receiver: User; sender: User }>>(
      'ContactInvitationCreated',
      (invitation) => {
        console.log('ContactInvitationCreated:', invitation);
        this.store.setEntity('invitations', invitation);
        this.store.setEntity('users', invitation.receiver);
        this.store.setEntity('users', invitation.sender);
        this.store.addToRelation(
          'usersReceivedInvitations',
          invitation.receiver.id,
          invitation.id
        );
        this.store.addToRelation(
          'usersSentInvitations',
          invitation.sender.id,
          invitation.id
        );
      }
    );

    this.onEvent<string>('ContactInvitationDeleted', (id) => {
      console.log('ContactInvitationDeleted:', id);
      const invitation = this.store.invitations().get(id);
      if (invitation) {
        this.store.deleteEntity('invitations', id);
        this.store.deleteFromRelation(
          'usersSentInvitations',
          invitation.senderId,
          id
        );
        this.store.deleteFromRelation(
          'usersReceivedInvitations',
          invitation.receiverId,
          id
        );
      }
    });
  }

  private listenForWorkspaceEvents() {}

  private listenForAreaEvents() {}

  private listenForRoomEvents() {}

  private listenForEventEvents() {}

  private listenForEventCategoryEvents() {}

  private listenForParticipantEvents() {}

  private listenForParticipantCategoryEvents() {}

  private listenForSlotEvents() {}

  private listenForTagEvents() {}

  private listenForLocationEvents() {}

  private listenForMemberEvents() {}

  private listenForWorkspaceRoleEvents() {}
}
