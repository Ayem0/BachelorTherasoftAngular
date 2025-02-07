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
import { catchError, of, tap } from 'rxjs';
import {
  EventCategory,
  EventCategoryForm,
  EventCategoryRequest,
} from '../../event-category';
import { EventCategoryStore } from '../../event-category.store';

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
  private readonly eventCategoryStore = inject(EventCategoryStore);
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
  public disabled = computed(
    () =>
      this.eventCategoryStore.updating() || this.eventCategoryStore.creating()
  );

  public form = new FormGroup<EventCategoryForm>({
    name: new FormControl(
      { value: this.eventCategory()?.name || '', disabled: this.disabled() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    color: new FormControl(
      { value: this.eventCategory()?.color || '', disabled: this.disabled() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    icon: new FormControl(
      { value: this.eventCategory()?.icon || '', disabled: this.disabled() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    description: new FormControl(
      {
        value: this.eventCategory()?.description || '',
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
      const req: EventCategoryRequest = this.form.getRawValue();
      if (this.eventCategory()) {
        this.eventCategoryStore
          .updateEventCategory(this.eventCategory()!.id, req)
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
        this.eventCategoryStore
          .createEventCategory(this.workspaceId(), req)
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
