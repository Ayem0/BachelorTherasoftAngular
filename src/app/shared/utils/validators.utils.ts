import { AbstractControl, ValidationErrors } from '@angular/forms';

export function matchPassword(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (password !== confirmPassword) {
    return { passwordNotMatch: true };
  }
  return null;
}

export function isFutureDate(
  control: AbstractControl
): ValidationErrors | null {
  const startDate: Date = control.get('startDate')?.value;
  const endDate: Date = control.get('endDate')?.value;
  if (startDate > endDate) {
    return { isNotFutureDate: true };
  }
  return null;
}
