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
import { RepetitionComponent } from '../../../../shared/components/repetition/repetition.component';
import { Repetition } from '../../../../shared/models/repetition';
import { EventCategoryService } from '../../../event-category/services/event-category.service';
import { Slot, SlotForm } from '../../models/slot';
import { SlotService } from '../../services/slot.service';

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
  private readonly slotService = inject(SlotService);
  private readonly eventCategoryService = inject(EventCategoryService);
  private readonly matDialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<SlotDialogComponent>);
  private readonly matDialogData: { workspaceId: string; slot: Slot | null } =
    inject(MAT_DIALOG_DATA);

  public workspaceId = signal(this.matDialogData.workspaceId).asReadonly();
  public slot = signal<Slot | null>(this.matDialogData.slot).asReadonly();
  public isUpdate = computed(() => !!this.slot());
  public eventCategories =
    this.eventCategoryService.eventCategoriesBySelectedWorkspaceId;
  public useRepetition = false;
  public isLoading = signal(false);

  public form = new FormGroup<SlotForm>({
    name: new FormControl(
      { value: this.slot()?.name || '', disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    description: new FormControl(
      {
        value: this.slot()?.description,
        disabled: this.isLoading(),
      },
      { nonNullable: true }
    ),
    startDate: new FormControl(
      {
        value: this.slot()?.startDate || new Date(),
        disabled: this.isLoading(),
      },
      { nonNullable: true, validators: [Validators.required] }
    ),
    endDate: new FormControl(
      { value: this.slot()?.endDate || new Date(), disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    startTime: new FormControl(
      {
        value: this.slot()?.startTime || new Date(),
        disabled: this.isLoading(),
      },
      { nonNullable: true, validators: [Validators.required] }
    ),
    endTime: new FormControl(
      { value: this.slot()?.endTime || new Date(), disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    eventCategoryIds: new FormControl(
      {
        value: [], // TODO manage to get the event categories from the slot
        disabled: this.isLoading(),
      },
      { nonNullable: true }
    ),
    repetitionInterval: new FormControl(
      {
        value: this.slot()?.repetitionInterval,
        disabled: this.isLoading(),
      },
      { nonNullable: true }
    ),
    repetitionNumber: new FormControl(
      {
        value: this.slot()?.repetitionNumber,
        disabled: this.isLoading(),
      },
      { nonNullable: true }
    ),
    repetitionEndDate: new FormControl(
      {
        value: this.slot()?.repetitionEndDate,
        disabled: this.isLoading(),
      },
      { nonNullable: true }
    ),
  });

  public async ngOnInit() {
    this.isLoading.set(true);
    this.eventCategoryService.selectedWorkspaceId.set(this.workspaceId());
    await this.eventCategoryService.getEventCategoriesByWorkspaceId(
      this.workspaceId()
    );
    this.isLoading.set(false);
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

  public async submit() {
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
      let canClose = false;
      this.isLoading.set(true);
      if (this.slot()) {
        canClose = await this.slotService.updateSlot(
          this.slot()!.id,
          slotRequest
        );
      } else {
        canClose = await this.slotService.createSlot(
          this.workspaceId(),
          slotRequest
        );
      }
      if (canClose) {
        this.dialogRef.close();
      }
      this.isLoading.set(false);
    }
  }
}
