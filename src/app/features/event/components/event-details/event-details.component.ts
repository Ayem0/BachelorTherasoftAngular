import { Component, computed, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { isFutureDate } from '../../../../shared/utils/validators';
import { EventRequestForm } from '../../models/event';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-details',
  imports: [
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    TranslateModule,
    MatProgressSpinner,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatCardModule,
    MatTooltip,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.scss',
})
export class EventDetailsComponent {
  private readonly matdialogRef = inject(MatDialogRef<EventDetailsComponent>);
  private readonly eventId: string = inject(MAT_DIALOG_DATA);
  private readonly eventService = inject(EventService);

  public isSubmitting = signal(false);
  public isEditMode = signal(false);

  private disabled = computed(() => this.isEditMode() && !this.isSubmitting());

  public event = this.eventService.detailedEvent(this.eventId);
  public isLoading = signal(false);
  public form = new FormGroup<EventRequestForm>(
    {
      description: new FormControl(
        {
          value: this.event()?.description ?? undefined,
          disabled: this.disabled(),
        },
        { nonNullable: true }
      ),
      startDate: new FormControl(
        {
          value: this.event()?.startDate ?? new Date(),
          disabled: this.disabled(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      endDate: new FormControl(
        {
          value: this.event()?.endDate ?? new Date(),
          disabled: this.disabled(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      eventCategoryId: new FormControl(
        {
          value: this.event()?.eventCategoryId ?? '',
          disabled: this.disabled(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      workspaceId: new FormControl(
        {
          value: this.event()?.workspaceId ?? '',
          disabled: this.disabled(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      roomId: new FormControl(
        {
          value: this.event()?.roomId ?? '',
          disabled: this.disabled(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      tagIds: new FormControl(
        {
          value: this.event()?.tagIds ?? [],
          disabled: this.disabled(),
        },
        { nonNullable: true }
      ),
      participantIds: new FormControl(
        {
          value: this.event()?.participantIds ?? [],
          disabled: this.disabled(),
        },
        { nonNullable: true }
      ),
      userIds: new FormControl(
        {
          value: this.event()?.userIds ?? [],
          disabled: this.disabled(),
        },
        { nonNullable: true }
      ),
      repetitionInterval: new FormControl(
        {
          value: undefined,
          disabled: this.disabled(),
        },
        { nonNullable: true }
      ),
      repetitionNumber: new FormControl(
        {
          value: undefined,
          disabled: this.disabled(),
        },
        { nonNullable: true }
      ),
      repetitionEndDate: new FormControl(
        {
          value: undefined,
          disabled: this.disabled(),
        },
        { nonNullable: true }
      ),
    },
    { validators: [isFutureDate] }
  );

  public closeDialog(): void {
    this.matdialogRef.close();
  }

  ngOnInit(): void {
    this.isLoading.set(true);
    this.eventService
      .getById(this.eventId)
      .subscribe(() => this.isLoading.set(false));

    this.form.disable();
  }

  public toggleEditMode() {
    this.isEditMode.update((isEditMode) => !isEditMode);
    if (this.isEditMode()) {
      this.form.enable();
    } else {
      this.form.disable();
    }
  }

  public save() {
    this.isSubmitting.set(true);
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.toggleEditMode();
    }, 200);
  }

  public cancel() {
    this.form.patchValue({
      description: this.event()?.description ?? undefined,
      startDate: this.event()?.startDate ?? new Date(),
      endDate: this.event()?.endDate ?? new Date(),
      eventCategoryId: this.event()?.eventCategoryId ?? '',
      workspaceId: this.event()?.workspaceId ?? '',
      roomId: this.event()?.roomId ?? '',
      tagIds: this.event()?.tagIds ?? [],
      participantIds: this.event()?.participantIds ?? [],
      userIds: this.event()?.userIds ?? [],
    });
    this.toggleEditMode();
  }
}
