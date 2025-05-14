import { Component, computed, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { User } from '../../../../core/auth/models/auth';
import {
  ContactInvitation,
  InvitationType,
  WorkspaceInvitation,
} from '../../models/invitation.model';
import { InvitationService } from '../../services/invitation.service';

@Component({
  selector: 'app-pending-invitation',
  imports: [MatButtonModule, MatIcon, MatTooltip, MatProgressSpinner],
  templateUrl: './pending-invitation.component.html',
  styleUrl: './pending-invitation.component.scss',
})
export class PendingInvitationComponent {
  private readonly invitationService = inject(InvitationService);

  public invitation = input.required<
    | ContactInvitation<{ receiver: User }>
    | WorkspaceInvitation<{ receiver: User; sender: User }>
  >();
  public workspaceInvitation = computed(() =>
    this.invitation()?.invitationType === InvitationType.Workspace
      ? (this.invitation() as WorkspaceInvitation<{
          receiver: User;
          sender: User;
        }>)
      : undefined
  );
  public isLoading = signal(false);

  public cancel() {
    this.isLoading.set(true);
    const sub =
      this.invitation().invitationType === InvitationType.Workspace
        ? this.invitationService.cancelWorkspaceInvitation(this.invitation().id)
        : this.invitationService.cancelContactInvitation(this.invitation().id);
    sub.subscribe(() => this.isLoading.set(false));
  }
}
