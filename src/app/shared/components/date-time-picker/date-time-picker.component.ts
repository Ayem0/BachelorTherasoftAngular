import { Component, forwardRef, ViewChild } from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDatepicker,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';

@Component({
  selector: 'app-date-time-picker',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatInputModule,
    FormsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true,
    },
  ],
  templateUrl: './date-time-picker.component.html',
  styleUrl: './date-time-picker.component.scss',
})
export class DateTimePickerComponent implements ControlValueAccessor {
  // Holds the combined Date value
  value: Date | null = null;
  // Separate values for date and time selections.
  selectedDate: Date | null = null;
  selectedTime: string = '12:00'; // Time in HH:mm format

  // Display value for the input field
  displayValue: string = '';

  // MatDatepicker reference (for opening/closing the popup)
  @ViewChild('picker') picker!: MatDatepicker<Date>;

  // ControlValueAccessor callbacks
  onChange: (value: Date | null) => void = () => {};
  onTouched: () => void = () => {};

  // Called when the user chooses a date
  onDateSelected(date: Date): void {
    this.selectedDate = date;
    this.updateValue();
    console.log(this.selectedDate, this.selectedTime);
  }

  // Called when the user chooses a time
  onTimeSelected(time: string): void {
    this.selectedTime = time;
    this.updateValue();
  }

  // Combine date and time into one Date object and update display
  updateValue(): void {
    if (this.selectedDate) {
      const [hours, minutes] = this.selectedTime.split(':').map(Number);
      const combined = new Date(this.selectedDate);
      combined.setHours(hours, minutes, 0, 0);
      this.value = combined;
      this.displayValue = combined.toLocaleString();
      this.onChange(this.value);
      this.onTouched();
    }
  }

  // ControlValueAccessor methods
  writeValue(value: Date | null): void {
    if (value) {
      this.value = new Date(value);
      this.selectedDate = new Date(value);
      this.selectedTime = this.value.toTimeString().slice(0, 5);
      this.displayValue = this.value.toLocaleString();
    } else {
      this.value = null;
      this.selectedDate = null;
      this.selectedTime = '12:00';
      this.displayValue = '';
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    // Optionally handle the disabled state if needed.
  }
}
