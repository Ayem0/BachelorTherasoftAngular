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
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';
import { PendingInvitationListComponent } from '../../../invitation/components/pending-invitation-list/pending-invitation-list.component';
import { InvitationService } from '../../../invitation/services/invitation.service';
import { ContactForm } from '../../models/contact';

@Component({
  selector: 'app-contact-dialog',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButton,
    MatInput,
    MatProgressSpinner,
    PendingInvitationListComponent,
    TranslateModule,
  ],
  templateUrl: './contact-dialog.component.html',
  styleUrl: './contact-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<ContactDialogComponent>);
  private readonly invitationService = inject(InvitationService);

  public pendingInvitations = this.invitationService.contactInvitationsSent();
  public isLoading = signal(false);
  public isLoadingPendingInvitations = signal(false);
  public form = new FormGroup<ContactForm>({
    email: new FormControl(
      { value: '', disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
  });

  public ngOnInit(): void {
    this.isLoadingPendingInvitations.set(true);
    this.invitationService
      .getSentInvitations()
      .subscribe(() => this.isLoadingPendingInvitations.set(false));
  }

  public submit() {
    if (this.form.valid) {
      const value = this.form.getRawValue();
      this.isLoading.set(true);
      this.invitationService
        .createContactInvitation(value.email)
        .pipe(takeUntil(this.dialogRef.afterClosed()))
        .subscribe((x) => {
          if (x) {
            this.dialogRef.close();
          }
          this.isLoading.set(false);
        });
    }
  }
}
