import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';
import { ContactService } from '../../../contact/services/contact.service';
import { PendingInvitationListComponent } from '../../../invitation/components/pending-invitation-list/pending-invitation-list.component';
import { InvitationService } from '../../../invitation/services/invitation.service';

@Component({
  selector: 'app-add-member-dialog',
  imports: [
    PendingInvitationListComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButton,
    MatProgressSpinner,
    MatSelectModule,
  ],
  templateUrl: './add-member-dialog.component.html',
  styleUrl: './add-member-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMemberDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<AddMemberDialogComponent>);
  private readonly invitationService = inject(InvitationService);
  private readonly contactService = inject(ContactService);
  private readonly workspaceId = inject(MAT_DIALOG_DATA) as string;

  public contacts = this.contactService.contacts();
  public pendingInvitations = this.invitationService.workspaceInvitations(
    this.workspaceId
  );
  public isLoading = signal(false);
  public isSubmitting = signal(false);
  public form = new FormGroup({
    userId: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  public ngOnInit(): void {
    this.isLoading.set(true);
    forkJoin([
      this.contactService.getContacts(),
      this.invitationService.getInvitationsByWorkspaceId(this.workspaceId),
    ]).subscribe(() => this.isLoading.set(false));
  }

  public submit() {
    if (this.form.valid) {
      const value = this.form.getRawValue();
      this.isSubmitting.set(true);
      this.invitationService
        .createWorkspaceInvitation(this.workspaceId, value.userId)
        .pipe()
        .subscribe((x) => {
          if (x) {
            this.dialogRef.close();
          }
          this.isSubmitting.set(false);
        });
    }
  }
}
