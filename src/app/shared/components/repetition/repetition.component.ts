import { KeyValuePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DayOfWeek } from '../../models/day-of-week';
import { Interval } from '../../models/interval';
import { Repetition } from '../../models/repetition';

@Component({
  selector: 'app-repetition',
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    KeyValuePipe,
    FormsModule,
    MatButtonModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './repetition.component.html',
  styleUrl: './repetition.component.scss',
})
export class RepetitionComponent {
  private readonly repetition: Repetition = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<RepetitionComponent>);

  public interval = Interval;
  public dayOfWeek = DayOfWeek;

  public form = new FormGroup({
    number: new FormControl(this.repetition?.number || 1, [
      Validators.required,
    ]),
    interval: new FormControl(this.repetition?.interval || Interval.weak, [
      Validators.required,
    ]),
    // days: new FormControl(this.repetition?.days, [Validators.required]), // TODO mettre le jour actuel
    endDate: new FormControl(this.repetition?.endDate, [Validators.required]),
  });

  public submit() {
    if (this.form.valid) {
      this.dialogRef.close();
    }
  }

  public cancel() {
    this.dialogRef.close();
  }
}
