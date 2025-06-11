import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { User } from '../../../../core/auth/models/auth';
import {
  ContactInvitation,
  WorkspaceInvitation,
} from '../../models/invitation.model';
import { PendingInvitationComponent } from '../pending-invitation/pending-invitation.component';

@Component({
  selector: 'app-pending-invitation-list',
  imports: [PendingInvitationComponent],
  templateUrl: './pending-invitation-list.component.html',
  styleUrl: './pending-invitation-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendingInvitationListComponent {
  public invitations = input.required<
    | ContactInvitation<{ receiver: User }>[]
    | WorkspaceInvitation<{ receiver: User; sender: User }>[]
  >();
}
