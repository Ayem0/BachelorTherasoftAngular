import { Component, computed, inject, input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { User } from '../../../../core/auth/models/auth';
import { InvitationStore } from '../../../invitation/services/invitation.store';
import { WorkspaceStore } from '../../../workspace/workspace.store';

@Component({
  selector: 'app-contact',
  imports: [
    MatButtonModule,
    MatIcon,
    MatTooltip,
    MatMenuModule,
    MatProgressSpinner,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements OnInit {
  private readonly workspaceStore = inject(WorkspaceStore);
  private readonly invitationStore = inject(InvitationStore);
  public contact = input.required<User>();
  public name = computed(
    () =>
      `${this.contact().firstName} ${this.contact()
        .lastName?.charAt(0)
        .toUpperCase()}`
  );
  public workspaces = this.workspaceStore.workspaces;
  public isLoadingWorkspaces = this.workspaceStore.loading;

  ngOnInit(): void {
    this.workspaceStore.getWorkspaces();
  }

  public inviteToWorkspace(workspaceId: string) {
    this.invitationStore.createWorkspaceInvitation([
      workspaceId,
      this.contact().id,
    ]);
  }
}
