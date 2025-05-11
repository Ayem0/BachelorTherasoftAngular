import { Component, computed, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Invitation, InvitationType } from '../../models/invitation.model';
import { InvitationService } from '../../services/invitation.service';

@Component({
  selector: 'app-invitation',
  imports: [MatButtonModule, MatIcon, MatProgressSpinner],
  templateUrl: './invitation.component.html',
  styleUrl: './invitation.component.scss',
})
export class InvitationComponent {
  private readonly invitationService = inject(InvitationService);
  public invitation = input.required<Invitation>();
  public isAccepting = signal(false);
  public isRefusing = signal(false);
  public isLoading = computed(() => this.isAccepting() || this.isRefusing());

  public accept() {
    this.isAccepting.set(true);
    const sub =
      this.invitation().invitationType === InvitationType.Contact
        ? this.invitationService.acceptContactInvitation(this.invitation().id)
        : this.invitationService.acceptWorkspaceInvitation(
            this.invitation().id
          );
    sub.subscribe(() => this.isAccepting.set(false));
  }

  public refuse() {
    this.isRefusing.set(true);
    const sub =
      this.invitation().invitationType === InvitationType.Contact
        ? this.invitationService.refuseContactInvitation(this.invitation().id)
        : this.invitationService.refuseWorkspaceInvitation(
            this.invitation().id
          );
    sub.subscribe(() => this.isRefusing.set(false));
  }
}
