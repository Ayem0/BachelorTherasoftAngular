import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ParticipantCategoryForm } from '../../models/participant-category';
import { ParticipantCategoryService } from '../../services/participant-category.service';

@Component({
  selector: 'app-participant-dialog',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatProgressSpinner,
    MatInputModule,
    MatButton,
  ],
  templateUrl: './participant-category-dialog.component.html',
  styleUrl: './participant-category-dialog.component.scss',
})
export class ParticipantCategoryDialogComponent {
  private readonly participantCategoryService = inject(
    ParticipantCategoryService
  );
  private readonly dialogRef = inject(
    MatDialogRef<ParticipantCategoryDialogComponent>
  );
  private readonly matDialogData: {
    workspaceId: string;
    participantCategoryId: string | undefined;
  } = inject(MAT_DIALOG_DATA);
  private workspaceId = this.matDialogData.workspaceId;
  private participantCategoryId = this.matDialogData.participantCategoryId;

  public participantCategory =
    this.participantCategoryService.participantCategoryById(
      this.matDialogData.participantCategoryId
    );
  public isUpdate = !!this.matDialogData.participantCategoryId;
  public isLoading = signal(false);

  public form = new FormGroup<ParticipantCategoryForm>({
    name: new FormControl(
      {
        value: this.participantCategory()?.name || '',
        disabled: this.isLoading(),
      },
      { nonNullable: true, validators: [Validators.required] }
    ),
    color: new FormControl(
      {
        value: this.participantCategory()?.color || '',
        disabled: this.isLoading(),
      },
      { nonNullable: true, validators: [Validators.required] }
    ),
    description: new FormControl(
      {
        value: this.participantCategory()?.description,
        disabled: this.isLoading(),
      },
      { nonNullable: true }
    ),
  });

  public submit() {
    if (this.form.valid) {
      const req = this.form.getRawValue();
      this.isLoading.set(true);
      const sub = this.participantCategoryId
        ? this.participantCategoryService.updateParticipantCategory(
            this.participantCategoryId,
            req
          )
        : this.participantCategoryService.createParticipantCategory(
            this.workspaceId,
            req
          );
      sub.subscribe((x) => {
        if (x) {
          this.dialogRef.close();
        }
        this.isLoading.set(false);
      });
    }
  }
}
