import { Component, computed, inject, signal } from '@angular/core';
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
import { catchError, of, tap } from 'rxjs';
import {
  ParticipantCategory,
  ParticipantCategoryForm,
} from '../../models/participant-category';
import { ParticipantCategoryStore } from '../../services/participant-category.store';

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
  private readonly participantCategoryStore = inject(ParticipantCategoryStore);
  private readonly dialogRef = inject(
    MatDialogRef<ParticipantCategoryDialogComponent>
  );
  private readonly matDialogData: {
    workspaceId: string;
    participantCategory: ParticipantCategory | null;
  } = inject(MAT_DIALOG_DATA);
  public participantCategory = signal<ParticipantCategory | null>(
    this.matDialogData.participantCategory
  );
  public workspaceId = this.matDialogData.workspaceId;
  public isUpdate = computed(() => !!this.participantCategory());
  public disabled = computed(
    () =>
      this.participantCategoryStore.updating() ||
      this.participantCategoryStore.creating()
  );

  public form = new FormGroup<ParticipantCategoryForm>({
    name: new FormControl(
      {
        value: this.participantCategory()?.name || '',
        disabled: this.disabled(),
      },
      { nonNullable: true, validators: [Validators.required] }
    ),
    color: new FormControl(
      {
        value: this.participantCategory()?.color || '',
        disabled: this.disabled(),
      },
      { nonNullable: true, validators: [Validators.required] }
    ),
    icon: new FormControl(
      {
        value: this.participantCategory()?.icon || '',
        disabled: this.disabled(),
      },
      { nonNullable: true, validators: [Validators.required] }
    ),
    description: new FormControl(
      {
        value: this.participantCategory()?.description,
        disabled: this.disabled(),
      },
      { nonNullable: true }
    ),
  });

  public submit() {
    if (
      this.form.valid &&
      this.form.value &&
      this.form.value.name &&
      this.form.value.color &&
      this.form.value.icon
    ) {
      const req = this.form.getRawValue();
      if (this.participantCategory()) {
        this.participantCategoryStore
          .updateParticipantCategory(this.participantCategory()!.id, req)
          .pipe(
            tap((res) => {
              this.dialogRef.close(res);
            }),
            catchError((err) => {
              console.log(err);
              return of();
            })
          )
          .subscribe();
      } else {
        this.participantCategoryStore
          .createParticipantCategory(this.workspaceId, req)
          .pipe(
            tap((res) => {
              this.dialogRef.close(res);
            }),
            catchError((err) => {
              console.log(err);
              return of();
            })
          )
          .subscribe();
      }
    }
  }
}
