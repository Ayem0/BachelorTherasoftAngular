import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { catchError, of, tap } from 'rxjs';
import { RepetitionComponent } from '../../../../shared/components/repetition/repetition.component';
import { Repetition } from '../../../../shared/models/repetition';
import { EventCategory } from '../../../event-category/event-category';
import { EventCategoryStore } from '../../../event-category/event-category.store';
import { Slot, SlotForm } from '../../slot';
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
    // KeyValuePipe
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './slot-dialog.component.html',
  styleUrl: './slot-dialog.component.scss',
})
export class SlotDialogComponent implements OnInit {
  private readonly slotStore = inject(SlotStore);
  private readonly eventCategoryStore = inject(EventCategoryStore);
  private readonly matDialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<SlotDialogComponent>);
  private readonly matDialogData: { workspaceId: string; slot: Slot | null } =
    inject(MAT_DIALOG_DATA);

  public workspaceId = signal(this.matDialogData.workspaceId).asReadonly();
  public slot = signal<Slot | null>(this.matDialogData.slot).asReadonly();
  public isUpdate = computed(() => !!this.slot());
  public eventCategories = signal<EventCategory[]>([]);
  public useRepetition = false;
  public disabled = computed(
    () => this.slotStore.updating() || this.slotStore.creating()
  );

  public form = new FormGroup<SlotForm>({
    name: new FormControl(
      { value: this.slot()?.name || '', disabled: this.disabled() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    description: new FormControl(
      {
        value: this.slot()?.description,
        disabled: this.disabled(),
      },
      { nonNullable: true }
    ),
    startDate: new FormControl(
      {
        value: this.slot()?.startDate || new Date(),
        disabled: this.disabled(),
      },
      { nonNullable: true, validators: [Validators.required] }
    ),
    endDate: new FormControl(
      { value: this.slot()?.endDate || new Date(), disabled: this.disabled() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    startTime: new FormControl(
      {
        value: this.slot()?.startTime || new Date(),
        disabled: this.disabled(),
      },
      { nonNullable: true, validators: [Validators.required] }
    ),
    endTime: new FormControl(
      { value: this.slot()?.endTime || new Date(), disabled: this.disabled() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    eventCategoryIds: new FormControl(
      {
        value: this.slot()?.eventCategoryIds || [],
        disabled: this.disabled(),
      },
      { nonNullable: true }
    ),
    repetitionInterval: new FormControl(
      {
        value: this.slot()?.repetitionInterval,
        disabled: this.disabled(),
      },
      { nonNullable: true }
    ),
    repetitionNumber: new FormControl(
      {
        value: this.slot()?.repetitionNumber,
        disabled: this.disabled(),
      },
      { nonNullable: true }
    ),
    repetitionEndDate: new FormControl(
      {
        value: this.slot()?.repetitionEndDate,
        disabled: this.disabled(),
      },
      { nonNullable: true }
    ),
  });

  public ngOnInit(): void {
    this.eventCategoryStore
      .getEventCategoriesByWorkspaceId(this.workspaceId())
      .subscribe((slotCategories) => {
        this.eventCategories.set(slotCategories);
      });
  }

  public openRepetitionDialog() {
    const repetition: Repetition = {
      number: this.slot()?.repetitionNumber,
      interval: this.slot()?.repetitionInterval,
      days: [],
      endDate: this.slot()?.repetitionEndDate,
    };
    this.matDialog.open(RepetitionComponent, { data: repetition });
  }

  public submit() {
    if (
      this.form.valid &&
      this.form.value &&
      this.form.value.name &&
      this.form.value.startDate &&
      this.form.value.endDate &&
      this.form.value.startTime &&
      this.form.value.endTime
    ) {
      const slotRequest = this.form.getRawValue();
      if (this.slot()) {
        this.slotStore
          .updateSlot(this.slot()!.id, slotRequest)
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
        this.slotStore
          .createSlot(this.workspaceId(), slotRequest)
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
