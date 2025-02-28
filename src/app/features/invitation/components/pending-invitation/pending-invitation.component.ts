import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { Invitation, InvitationType } from '../../models/invitation.model';
import { InvitationStore } from '../../services/invitation.store';

@Component({
  selector: 'app-pending-invitation',
  imports: [MatButtonModule, MatIcon, MatTooltip],
  templateUrl: './pending-invitation.component.html',
  styleUrl: './pending-invitation.component.scss',
})
export class PendingInvitationComponent {
  private readonly invitationStore = inject(InvitationStore);
  public invitation = input.required<Invitation>();

  public cancel() {
    switch (this.invitation().invitationType) {
      case InvitationType.Workspace:
        this.invitationStore.cancelWorkspaceInvitation(this.invitation().id);
        break;
      case InvitationType.Contact:
        this.invitationStore.cancelContactInvitation(this.invitation().id);
        break;
    }
  }
}
