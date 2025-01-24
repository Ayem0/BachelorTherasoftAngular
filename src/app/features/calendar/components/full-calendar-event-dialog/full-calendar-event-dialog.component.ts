import { Component, computed, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Event } from '../../../event/models/event';
import { EventService } from '../../../event/services/event.service';
import { EventStore } from '../../../event/services/event.store';

@Component({
  selector: 'app-full-calendar-event-dialog',
  imports: [],
  templateUrl: './full-calendar-event-dialog.component.html',
  styleUrl: './full-calendar-event-dialog.component.scss'
})
export class FullCalendarEventDialogComponent {
  private readonly eventService = inject(EventService);
  private readonly matDialogData : { event: Event } = inject(MAT_DIALOG_DATA).signal;
  public readonly matDialogRef = inject(MatDialogRef);
  private readonly eventStore = inject(EventStore);

  public disabled = computed(() => this.eventStore.creating() || this.eventStore.updating());


  

  public form = new FormGroup({
      description: new FormControl({ value: this.matDialogData.event?.description, disabled: this.disabled() }),
      startDate: new FormControl({ value: this.matDialogData.event?.startDate || "", disabled: this.disabled() }, [Validators.required]),
      endDate: new FormControl({ value: this.matDialogData.event?.endDate, disabled: this.disabled() }, [Validators.required]),
      eventCategoryIds: new FormControl({ value: this.matDialogData.event?.eventCategory, disabled: this.disabled() }),
      repetitionInterval: new FormControl({ value: this.matDialogData.event?.repetitionInterval, disabled: this.disabled() }),
      repetitionNumber: new FormControl({ value: this.matDialogData.event?.repetitionNumber, disabled: this.disabled() }),
      repetitionEndDate: new FormControl({ value: this.matDialogData.event?.repetitionEndDate, disabled: this.disabled() }),
    });
  close() {
    this.matDialogRef.close();
  }
}
