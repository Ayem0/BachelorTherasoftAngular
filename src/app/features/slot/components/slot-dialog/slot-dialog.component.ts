import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
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
import { Id } from '../../../../shared/models/entity';
import { Repetition } from '../../../../shared/models/repetition';
import { EventCategoryService } from '../../../event-category/services/event-category.service';
import { SlotForm } from '../../models/slot';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlotDialogComponent implements OnInit {
  private readonly slotService = inject(SlotService);
  private readonly eventCategoryService = inject(EventCategoryService);
  private readonly matDialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<SlotDialogComponent>);
  private readonly matDialogData: { workspaceId: Id; slotId: Id | undefined } =
    inject(MAT_DIALOG_DATA);

  private readonly workspaceId = signal(this.matDialogData.workspaceId);
  private readonly slotId = this.matDialogData.slotId;
  public slot = this.slotService.slotById(this.matDialogData.slotId);
  public isUpdate = signal(!!this.matDialogData.slotId);
  public eventCategories =
    this.eventCategoryService.eventCategoriesByWorkspaceId(this.workspaceId);
  public useRepetition = false;
  public isLoading = signal(false);

  public form = new FormGroup<SlotForm>({
    name: new FormControl(
      { value: this.slot()?.name ?? '', disabled: this.isLoading() },
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
        value: this.slot()?.startDate ?? new Date(),
        disabled: this.isLoading(),
      },
      { nonNullable: true, validators: [Validators.required] }
    ),
    endDate: new FormControl(
      { value: this.slot()?.endDate ?? new Date(), disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    startTime: new FormControl(
      {
        value: this.slot()?.startTime ?? new Date(),
        disabled: this.isLoading(),
      },
      { nonNullable: true, validators: [Validators.required] }
    ),
    endTime: new FormControl(
      { value: this.slot()?.endTime ?? new Date(), disabled: this.isLoading() },
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

  public ngOnInit() {
    this.isLoading.set(true);
    this.eventCategoryService
      .getEventCategoriesByWorkspaceId(this.matDialogData.workspaceId)
      .subscribe(() => this.isLoading.set(false));
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
    if (this.form.valid) {
      const req = this.form.getRawValue();
      this.isLoading.set(true);
      const sub = this.slotId
        ? this.slotService.updateSlot(this.slotId, req)
        : this.slotService.createSlot(this.workspaceId(), req);
      sub.subscribe((x) => {
        if (x) {
          this.dialogRef.close();
        }
        this.isLoading.set(false);
      });
    }
  }
}
