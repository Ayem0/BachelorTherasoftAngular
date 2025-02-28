import { Component, input } from '@angular/core';
import { Invitation } from '../../models/invitation.model';
import { PendingInvitationComponent } from '../pending-invitation/pending-invitation.component';

@Component({
  selector: 'app-pending-invitation-list',
  imports: [PendingInvitationComponent],
  templateUrl: './pending-invitation-list.component.html',
  styleUrl: './pending-invitation-list.component.scss',
})
export class PendingInvitationListComponent {
  public invitations = input.required<Invitation[]>();
}
