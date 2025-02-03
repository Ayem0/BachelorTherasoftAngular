import { Component, computed, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { DateTimePickerComponent } from '../../../../shared/components/date-time-picker/date-time-picker.component';
import { RepetitionComponent } from '../../../../shared/components/repetition/repetition.component';
import { Repetition } from '../../../../shared/models/repetition';
import { EventCategory } from '../../../event-category/event-category';
import { EventCategoryStore } from '../../../event-category/event-category.store';
import { Event } from '../../../event/models/event';
import { EventStore } from '../../../event/services/event.store';

@Component({
  selector: 'app-full-calendar-event-dialog',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTimepickerModule,
    MatInputModule,
    MatDatepickerModule,
    MatProgressSpinner,
    MatButtonModule,
    DateTimePickerComponent,
  ],
  templateUrl: './full-calendar-event-dialog.component.html',
  styleUrl: './full-calendar-event-dialog.component.scss',
})
export class FullCalendarEventDialogComponent {
  private readonly matDialog = inject(MatDialog);
  public readonly matDialogRef = inject(
    MatDialogRef<FullCalendarEventDialogComponent>
  );
  private readonly eventStore = inject(EventStore);
  private readonly eventCategoryStore = inject(EventCategoryStore);
  private readonly matDialogData: {
    event: Event | null;
    startDate: Date | null;
    endDate: Date | null;
  } = inject(MAT_DIALOG_DATA);
  public event = signal(this.matDialogData.event);
  public disabled = computed(
    () => this.eventStore.creating() || this.eventStore.updating()
  );
  public isUpdate = computed(() => !!this.event());
  public eventCategories = signal<EventCategory[]>([]);

  public form = new FormGroup({
    description: new FormControl({
      value: this.event()?.description,
      disabled: this.disabled(),
    }),
    startDate: new FormControl(
      { value: this.event()?.startDate, disabled: this.disabled() },
      [Validators.required]
    ),
    endDate: new FormControl(
      { value: this.event()?.endDate, disabled: this.disabled() },
      [Validators.required]
    ),
    eventCategoryIds: new FormControl({
      value: this.event()?.eventCategory,
      disabled: this.disabled(),
    }),
    workspaceId: new FormControl({
      value: this.event()?.workspaceId,
      disabled: this.disabled(),
    }),
    repetitionInterval: new FormControl({
      value: this.event()?.repetitionInterval,
      disabled: this.disabled(),
    }),
    repetitionNumber: new FormControl({
      value: this.event()?.repetitionNumber,
      disabled: this.disabled(),
    }),
    repetitionEndDate: new FormControl({
      value: this.event()?.repetitionEndDate,
      disabled: this.disabled(),
    }),
  });

  public close() {
    this.matDialogRef.close();
  }

  public openRepetitionDialog() {
    const repetition: Repetition = {
      number: this.event()?.repetitionNumber,
      interval: this.event()?.repetitionInterval,
      days: [],
      endDate: this.event()?.repetitionEndDate,
    };
    this.matDialog.open(RepetitionComponent, { data: repetition });
  }

  public submit() {}
}
