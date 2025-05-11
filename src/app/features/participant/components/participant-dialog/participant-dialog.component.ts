import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ParticipantCategoryService } from '../../../participant-category/services/participant-category.service';
import { ParticipantForm } from '../../models/participant';
import { ParticipantService } from '../../services/participant.service';

@Component({
  selector: 'app-participant-dialog',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatProgressSpinner,
    MatInputModule,
    MatButton,
    MatSelectModule,
    FormsModule,
    MatDatepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './participant-dialog.component.html',
  styleUrl: './participant-dialog.component.scss',
})
export class ParticipantDialogComponent implements OnInit {
  private readonly participantService = inject(ParticipantService);
  private readonly participantCategoryService = inject(
    ParticipantCategoryService
  );
  private readonly dialogRef = inject(MatDialogRef<ParticipantDialogComponent>);
  private readonly matDialogData: {
    workspaceId: string;
    participantId: string | undefined;
  } = inject(MAT_DIALOG_DATA);

  public workspaceId = this.matDialogData.workspaceId;
  public participantId = this.matDialogData.participantId;
  public participant = this.participantService.participantById(
    this.participantId
  );
  public isUpdate = !!this.participantId;
  public participantCategories =
    this.participantCategoryService.participantCategoriesByWorkspaceId(
      this.workspaceId
    );
  public isLoading = signal(false);
  public form = new FormGroup<ParticipantForm>({
    firstName: new FormControl(
      {
        value: this.participant()?.firstName ?? '',
        disabled: this.isLoading(),
      },
      { nonNullable: true, validators: [Validators.required] }
    ),
    lastName: new FormControl(
      { value: this.participant()?.lastName ?? '', disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    participantCategoryId: new FormControl(
      {
        value: this.participant()?.participantCategoryId ?? '',
        disabled: this.isLoading(),
      },
      { nonNullable: true, validators: [Validators.required] }
    ),
    description: new FormControl(
      { value: this.participant()?.description, disabled: this.isLoading() },
      { nonNullable: true }
    ),
    email: new FormControl(
      { value: this.participant()?.country, disabled: this.isLoading() },
      { nonNullable: true }
    ),
    phoneNumber: new FormControl(
      { value: this.participant()?.phoneNumber, disabled: this.isLoading() },
      { nonNullable: true }
    ),
    address: new FormControl(
      { value: this.participant()?.address, disabled: this.isLoading() },
      { nonNullable: true }
    ),
    city: new FormControl(
      { value: this.participant()?.city, disabled: this.isLoading() },
      { nonNullable: true }
    ),
    country: new FormControl(
      { value: this.participant()?.country, disabled: this.isLoading() },
      { nonNullable: true }
    ),
    dateOfBirth: new FormControl(
      { value: this.participant()?.dateOfBirth, disabled: this.isLoading() },
      { nonNullable: true }
    ),
  });

  public async ngOnInit() {
    this.isLoading.set(true);
    await this.participantCategoryService.getParticipantCategoriesByWorkspaceId(
      this.workspaceId
    );
    this.isLoading.set(false);
  }

  public async submit() {
    if (this.form.valid) {
      const req = this.form.getRawValue();
      let canClose = false;
      if (this.participant()) {
        canClose = await this.participantService.updateParticipant(
          this.participant()!.id,
          req
        );
      } else {
        canClose = await this.participantService.createParticipant(
          this.workspaceId,
          req
        );
      }
      if (canClose) {
        this.dialogRef.close();
      }
    }
  }
}
