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
import { RepetitionComponent } from '../../../../shared/components/repetition/repetition.component';
import { Interval } from '../../../../shared/models/interval';
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
    start: Date | null;
    end: Date | null;
  } = inject(MAT_DIALOG_DATA);
  public event = signal(this.matDialogData.event);
  public disabled = computed(
    () => this.eventStore.creating() || this.eventStore.updating()
  );
  public isUpdate = computed(() => !!this.event());
  public eventCategories = signal<EventCategory[]>([]);

  public form = new FormGroup({
    description: new FormControl<string | undefined>(
      {
        value: this.event()?.description,
        disabled: this.disabled(),
      },
      { nonNullable: true }
    ),
    startDate: new FormControl<Date>(
      {
        value:
          this.event()?.startDate || this.matDialogData.start || new Date(),
        disabled: this.disabled(),
      },
      { nonNullable: true, validators: [Validators.required] }
    ),
    endDate: new FormControl<Date>(
      {
        value: this.event()?.endDate || this.matDialogData.end || new Date(),
        disabled: this.disabled(),
      },
      { nonNullable: true, validators: [Validators.required] }
    ),
    eventCategoryId: new FormControl<string>(
      {
        value: this.event()?.eventCategoryId || '',
        disabled: this.disabled(),
      },
      { nonNullable: true, validators: [Validators.required] }
    ),
    workspaceId: new FormControl<string>(
      {
        value: this.event()?.workspaceId || '',
        disabled: this.disabled(),
      },
      { nonNullable: true, validators: [Validators.required] }
    ),
    roomId: new FormControl<string>(
      {
        value: this.event()?.roomId ?? '',
        disabled: this.disabled(),
      },
      { nonNullable: true, validators: [Validators.required] }
    ),
    tagIds: new FormControl<string[]>(
      {
        value: this.event()?.tagIds ?? [],
        disabled: this.disabled(),
      },
      { nonNullable: true }
    ),
    participantIds: new FormControl<string[]>(
      {
        value: this.event()?.participantIds ?? [],
        disabled: this.disabled(),
      },
      { nonNullable: true }
    ),
    userIds: new FormControl<string[]>(
      {
        value: this.event()?.userIds ?? [],
        disabled: this.disabled(),
      },
      { nonNullable: true }
    ),
    repetitionInterval: new FormControl<Interval | undefined>(
      {
        value: this.event()?.repetitionInterval,
        disabled: this.disabled(),
      },
      { nonNullable: true }
    ),
    repetitionNumber: new FormControl<number | undefined>(
      {
        value: this.event()?.repetitionNumber,
        disabled: this.disabled(),
      },
      { nonNullable: true }
    ),
    repetitionEndDate: new FormControl<Date | undefined>(
      {
        value: this.event()?.repetitionEndDate,
        disabled: this.disabled(),
      },
      { nonNullable: true }
    ),
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

  public submit() {
    if (this.form.valid) {
      const req = this.form.getRawValue();
      if (this.event()) {
        this.eventStore.updateEvent(this.event()!.id, req);
      } else {
        this.eventStore.createEvent(req);
      }
    }
  }
}
