import { Component, computed, inject, Signal, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { catchError, of, tap } from 'rxjs';
import { EventCategory } from '../../event-category';
import { EventCategoryStore } from '../../event-category.store';

@Component({
  selector: 'app-event-category-dialog',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatProgressSpinner,
    MatInputModule,
    MatButton
  ],
  templateUrl: './event-category-dialog.component.html',
  styleUrl: './event-category-dialog.component.scss'
})
export class EventCategoryDialogComponent {
  private readonly eventCategoryStore = inject(EventCategoryStore);
  private readonly dialogRef = inject(MatDialogRef<EventCategoryDialogComponent>);
  private readonly matDialogData : { workspaceId: Signal<string>, eventCategory: EventCategory | null } = inject(MAT_DIALOG_DATA);
  public eventCategory = signal<EventCategory | null>(this.matDialogData.eventCategory);
  public workspaceId = this.matDialogData.workspaceId;
  public isUpdate = computed(() => !!this.eventCategory());
  public disabled = computed(() => this.eventCategoryStore.updating() || this.eventCategoryStore.creating());

  public form = new FormGroup({
    name: new FormControl({ value: this.eventCategory()?.name || "", disabled: this.disabled() }, [Validators.required]),
    color: new FormControl({ value: this.eventCategory()?.color || "", disabled: this.disabled() }, [Validators.required]),
    icon: new FormControl({ value: this.eventCategory()?.icon || "", disabled: this.disabled() }, [Validators.required]),
    description: new FormControl({ value: this.eventCategory()?.description || "", disabled: this.disabled() }),
  });

  public submit() {
    if(this.form.valid && this.form.value && this.form.value.name && this.form.value.color && this.form.value.icon) {
      const { name, color, icon, description } = this.form.value;
      if (this.eventCategory()) {
        this.eventCategoryStore.updateEventCategory(
          this.eventCategory()!.id, 
          name, 
          color, 
          icon,
          description ?? undefined
        ).pipe(
          tap(res => {
            this.dialogRef.close(res);
          }),
          catchError((err) => {
            console.log(err);
            return of()
          })
        ).subscribe();
      } else {
        this.eventCategoryStore.createEventCategory(
          this.workspaceId(),
          name, 
          color, 
          icon,
          description ?? undefined
        ).pipe(
          tap(res => {
            this.dialogRef.close(res);
          }),
          catchError((err) => {
            console.log(err);
            return of()
          })
        ).subscribe();
      }
    }
  }
}
