import { KeyValuePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { catchError, of, tap } from 'rxjs';
import { Interval } from '../../../../shared/models/interval';
import { EventCategory } from '../../../event-category/event-category';
import { EventCategoryStore } from '../../../event-category/event-category.store';
import { Slot } from '../../slot';
import { SlotStore } from '../../slot.store';

@Component({
  selector: 'app-slot-dialog',
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
    MatTimepickerModule,
    MatSlideToggleModule,
    KeyValuePipe
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './slot-dialog.component.html',
  styleUrl: './slot-dialog.component.scss'
})
export class SlotDialogComponent implements OnInit {
  readonly slotStore = inject(SlotStore);
  readonly eventCategoryStore = inject(EventCategoryStore);
  private readonly dialogRef = inject(MatDialogRef<SlotDialogComponent>);
  private readonly matDialogData : { workspaceId: string, slot: Slot | null } = inject(MAT_DIALOG_DATA);

  public repetitionInterval = Interval;
  public workspaceId = signal(this.matDialogData.workspaceId).asReadonly();
  public slot = signal<Slot | null>(this.matDialogData.slot).asReadonly();
  public isUpdate = computed(() => !!this.slot());
  public eventCategories = signal<EventCategory[]>([]);
  public useRepetition = false;

  public form = new FormGroup({
    name: new FormControl({ value: this.slot()?.name || "", disabled: this.slotStore.updating() || this.slotStore.creating() }, [Validators.required]),
    description: new FormControl({ value: this.slot()?.description, disabled: this.slotStore.updating() || this.slotStore.creating() }),
    startDate: new FormControl({ value: this.slot()?.startDate || "", disabled: this.slotStore.updating() || this.slotStore.creating() }, [Validators.required]),
    endDate: new FormControl({ value: this.slot()?.endDate, disabled: this.slotStore.updating() || this.slotStore.creating() }, [Validators.required]),
    startTime: new FormControl({ value: this.slot()?.startTime || "", disabled: this.slotStore.updating() || this.slotStore.creating() }),
    endTime: new FormControl({ value: this.slot()?.endTime || "", disabled: this.slotStore.updating() || this.slotStore.creating() }),
    eventCategoryIds: new FormControl({ value: this.slot()?.eventCategoryIds || [], disabled: this.slotStore.updating() || this.slotStore.creating() }),
    repetitionInterval: new FormControl({ value: this.slot()?.repetitionInterval, disabled: this.slotStore.updating() || this.slotStore.creating() }),
    repetitionNumber: new FormControl({ value: this.slot()?.repetitionNumber, disabled: this.slotStore.updating() || this.slotStore.creating() }),
    repetitionEndDate: new FormControl({ value: this.slot()?.repetitionEndDate, disabled: this.slotStore.updating() || this.slotStore.creating() }),
  });

  public ngOnInit(): void {
    this.eventCategoryStore.getEventCategoriesByWorkspaceId(this.workspaceId()).subscribe(slotCategories => {
      this.eventCategories.set(slotCategories);
    });
  }

  public submit() {
    if(this.form.valid && this.form.value && this.form.value.name && this.form.value.startDate && this.form.value.endDate && this.form.value.startTime
      && this.form.value.endTime && this.form.value.eventCategoryIds
    ) {
      const { name, description, startDate, endDate, startTime, endTime, eventCategoryIds, repetitionInterval, repetitionNumber, repetitionEndDate } = this.form.value;
      if (this.slot()) {
        this.slotStore.updateSlot(
          this.workspaceId(), 
          this.slot()!.id, 
          name, 
          startDate, 
          endDate,
          startTime, 
          endTime, 
          eventCategoryIds, 
          repetitionInterval ?? undefined, 
          repetitionNumber ?? undefined, 
          repetitionEndDate ?? undefined,
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
        this.slotStore.createSlot(
          this.workspaceId(), 
          name, 
          startDate, 
          endDate,
          startTime, 
          endTime, 
          eventCategoryIds, 
          repetitionInterval ?? undefined, 
          repetitionNumber ?? undefined, 
          repetitionEndDate ?? undefined,
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
