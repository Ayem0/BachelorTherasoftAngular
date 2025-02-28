import { Component, inject, OnInit, signal } from '@angular/core';
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
import { PendingInvitationListComponent } from '../../../invitation/components/pending-invitation-list/pending-invitation-list.component';
import { InvitationStore } from '../../../invitation/services/invitation.store';
import { ContactForm } from '../../models/contact.model';

@Component({
  selector: 'app-contact-dialog',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButton,
    MatInput,
    MatProgressSpinner,
    PendingInvitationListComponent,
  ],
  templateUrl: './contact-dialog.component.html',
  styleUrl: './contact-dialog.component.scss',
})
export class ContactDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<ContactDialogComponent>);
  private readonly invitationStore = inject(InvitationStore);

  public pendingInvitations = this.invitationStore.pendingContactInvitations;
  public disabled = signal(false);
  public form = new FormGroup<ContactForm>({
    email: new FormControl(
      { value: '', disabled: this.disabled() },
      { nonNullable: true, validators: [Validators.required] }
    ),
  });

  public ngOnInit(): void {
    this.invitationStore.getPendingInvitations();
  }

  public submit() {
    if (this.form.valid) {
      const value = this.form.getRawValue();
      this.invitationStore.createContactInvitation(value.email);
      this.dialogRef.close();
    }
  }
}
