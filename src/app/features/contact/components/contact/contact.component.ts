import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { User } from '../../../../core/auth/models/auth';
import { InvitationService } from '../../../invitation/services/invitation.service';
import { Workspace } from '../../../workspace/models/workspace';

@Component({
  selector: 'app-contact',
  imports: [
    MatButtonModule,
    MatIcon,
    MatTooltip,
    MatMenuModule,
    MatProgressSpinner,
    TranslateModule,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private readonly invitationService = inject(InvitationService);
  public contact = input.required<User>();
  public workspaces = input.required<Workspace[]>();
  public name = computed(
    () =>
      `${this.contact().firstName} ${this.contact()
        .lastName?.charAt(0)
        .toUpperCase()}`
  );
  public isLoading = signal<string | null>(null);

  public inviteToWorkspace(workspaceId: string) {
    this.isLoading.set(workspaceId);
    this.invitationService
      .createWorkspaceInvitation(workspaceId, this.contact().id)
      .subscribe(() => this.isLoading.set(null));
  }
}
