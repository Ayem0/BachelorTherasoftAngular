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
import { EventCategoryForm } from '../../models/event-category';
import { EventCategoryService } from '../../services/event-category.service';

@Component({
  selector: 'app-event-category-dialog',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatProgressSpinner,
    MatInputModule,
    MatButton,
  ],
  templateUrl: './event-category-dialog.component.html',
  styleUrl: './event-category-dialog.component.scss',
})
export class EventCategoryDialogComponent {
  private readonly eventCategoryService = inject(EventCategoryService);
  private readonly dialogRef = inject(
    MatDialogRef<EventCategoryDialogComponent>
  );
  private readonly matDialogData: {
    workspaceId: string;
    eventCategoryId: string | undefined;
  } = inject(MAT_DIALOG_DATA);

  public workspaceId = this.matDialogData.workspaceId;
  public eventCategoryId = this.matDialogData.eventCategoryId;
  public eventCategory = this.eventCategoryService.eventCategoryById(
    this.eventCategoryId
  );
  public isUpdate = !!this.eventCategoryId;
  public isLoading = signal(false);
  public form = new FormGroup<EventCategoryForm>({
    name: new FormControl(
      { value: this.eventCategory()?.name ?? '', disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    color: new FormControl(
      { value: this.eventCategory()?.color ?? '', disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    icon: new FormControl(
      { value: this.eventCategory()?.icon ?? '', disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    description: new FormControl(
      {
        value: this.eventCategory()?.description,
        disabled: this.isLoading(),
      },
      { nonNullable: true }
    ),
  });

  public submit() {
    if (this.form.valid) {
      const req = this.form.getRawValue();
      this.isLoading.set(true);
      const sub = this.eventCategoryId
        ? this.eventCategoryService.updateEventCategory(
            this.eventCategoryId,
            req
          )
        : this.eventCategoryService.createEventCategory(this.workspaceId, req);
      sub.subscribe((x) => {
        if (x) {
          this.dialogRef.close();
        }
        this.isLoading.set(false);
      });
    }
  }
}
