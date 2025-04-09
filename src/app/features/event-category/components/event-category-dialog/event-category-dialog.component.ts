import { Component, computed, inject, Signal, signal } from '@angular/core';
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
import {
  EventCategory,
  EventCategoryForm,
  EventCategoryRequest,
} from '../../models/event-category';
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
    workspaceId: Signal<string>;
    eventCategory: EventCategory | null;
  } = inject(MAT_DIALOG_DATA);
  public eventCategory = signal<EventCategory | null>(
    this.matDialogData.eventCategory
  );
  public workspaceId = this.matDialogData.workspaceId;
  public isUpdate = computed(() => !!this.eventCategory());
  public isLoading = signal(false);
  public form = new FormGroup<EventCategoryForm>({
    name: new FormControl(
      { value: this.eventCategory()?.name || '', disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    color: new FormControl(
      { value: this.eventCategory()?.color || '', disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    icon: new FormControl(
      { value: this.eventCategory()?.icon || '', disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    description: new FormControl(
      {
        value: this.eventCategory()?.description || '',
        disabled: this.isLoading(),
      },
      { nonNullable: true }
    ),
  });

  public async submit() {
    if (
      this.form.valid &&
      this.form.value &&
      this.form.value.name &&
      this.form.value.color &&
      this.form.value.icon
    ) {
      const req: EventCategoryRequest = this.form.getRawValue();
      let canClose = false;
      this.isLoading.set(true);
      if (this.eventCategory()) {
        canClose = await this.eventCategoryService.updateEventCategory(
          this.eventCategory()!.id,
          this.workspaceId(),
          req
        );
      } else {
        canClose = await this.eventCategoryService.createEventCategory(
          this.workspaceId(),
          req
        );
      }
      if (canClose) {
        this.dialogRef.close(true);
      }
      this.isLoading.set(false);
    }
  }
}
