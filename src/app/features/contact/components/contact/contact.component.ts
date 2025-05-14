import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { User } from '../../../../core/auth/models/auth';
import { InvitationService } from '../../../invitation/services/invitation.service';
import { WorkspaceService } from '../../../workspace/services/workspace.service';

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
  private readonly workspaceService = inject(WorkspaceService);
  private readonly invitationService = inject(InvitationService);
  public contact = input.required<User>();
  public name = computed(
    () =>
      `${this.contact().firstName} ${this.contact()
        .lastName?.charAt(0)
        .toUpperCase()}`
  );
  public workspaces = this.workspaceService.workspaces();
  public isLoading = signal(false);

  public ngOnInit() {
    this.isLoading.set(true);
    this.workspaceService
      .getWorkspaces()
      .subscribe(() => this.isLoading.set(false));
  }

  public inviteToWorkspace(workspaceId: string) {
    this.invitationService
      .createWorkspaceInvitation(workspaceId, this.contact().id)
      .subscribe();
  }
}
