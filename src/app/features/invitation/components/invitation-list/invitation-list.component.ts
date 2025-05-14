import { Component, inject, OnInit, signal } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { InvitationService } from '../../services/invitation.service';
import { InvitationComponent } from '../invitation/invitation.component';

@Component({
  selector: 'app-invitation-list',
  imports: [InvitationComponent, MatProgressSpinner],
  templateUrl: './invitation-list.component.html',
  styleUrl: './invitation-list.component.scss',
})
export class InvitationListComponent implements OnInit {
  private readonly invitationService = inject(InvitationService);

  public invitationsReceived = this.invitationService.invitationsReceived();
  public isLoading = signal(false);

  public ngOnInit(): void {
    this.isLoading.set(true);
    this.invitationService
      .getReceivedInvitations()
      .subscribe(() => this.isLoading.set(false));
  }
}
