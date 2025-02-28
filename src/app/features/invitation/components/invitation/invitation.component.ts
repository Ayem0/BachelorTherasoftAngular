import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Invitation, InvitationType } from '../../models/invitation.model';
import { InvitationStore } from '../../services/invitation.store';

@Component({
  selector: 'app-invitation',
  imports: [MatButtonModule, MatIcon],
  templateUrl: './invitation.component.html',
  styleUrl: './invitation.component.scss',
})
export class InvitationComponent {
  private readonly invitationStore = inject(InvitationStore);
  invitation = input.required<Invitation>();

  public accept() {
    if (this.invitation().invitationType === InvitationType.Contact) {
      this.invitationStore.acceptContactInvitation(this.invitation().id);
    } else {
      this.invitationStore.acceptWorkspaceInvitation(this.invitation().id);
    }
  }

  public refuse() {
    if (this.invitation().invitationType === InvitationType.Contact) {
      this.invitationStore.refuseContactInvitation(this.invitation().id);
    } else {
      this.invitationStore.refuseWorkspaceInvitation(this.invitation().id);
    }
  }
}
