import { Component, inject, OnInit } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { InvitationStore } from '../../services/invitation.store';
import { InvitationComponent } from '../invitation/invitation.component';

@Component({
  selector: 'app-invitation-list',
  imports: [InvitationComponent, MatProgressSpinner],
  templateUrl: './invitation-list.component.html',
  styleUrl: './invitation-list.component.scss',
})
export class InvitationListComponent implements OnInit {
  private readonly invitationStore = inject(InvitationStore);

  public invitationsReceived = this.invitationStore.invitationsReceived;
  public isLoaded = this.invitationStore.isReceivedInvitationsLoaded;

  ngOnInit(): void {
    this.invitationStore.getReceivedInvitations();
  }
}
