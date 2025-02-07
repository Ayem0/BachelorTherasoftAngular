import { Component, computed, inject, Signal, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { catchError, of, tap } from 'rxjs';
import { LocationForm, LocationRequest, Place } from '../../location';
import { LocationStore } from '../../location.store';

@Component({
  selector: 'app-location-dialog',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatProgressSpinner,
    MatInputModule,
    MatButton,
  ],
  templateUrl: './location-dialog.component.html',
  styleUrl: './location-dialog.component.scss',
})
export class LocationDialogComponent {
  private readonly locationStore = inject(LocationStore);
  private readonly dialogRef = inject(MatDialogRef<LocationDialogComponent>);
  private readonly matDialogData: {
    workspaceId: Signal<string>;
    location: Place | null;
  } = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  public location = signal<Place | null>(this.matDialogData.location);
  public workspaceId = this.matDialogData.workspaceId;
  public isUpdate = computed(() => !!this.location());
  public disabled = computed(
    () => this.locationStore.updating() || this.locationStore.creating()
  );

  public form = new FormGroup<LocationForm>({
    name: new FormControl(
      { value: this.location()?.name || '', disabled: this.disabled() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    description: new FormControl(
      { value: this.location()?.description || '', disabled: this.disabled() },
      { nonNullable: true }
    ),
    address: new FormControl(
      { value: this.location()?.address || '', disabled: this.disabled() },
      { nonNullable: true }
    ),
    city: new FormControl(
      { value: this.location()?.city || '', disabled: this.disabled() },
      { nonNullable: true }
    ),
    country: new FormControl(
      { value: this.location()?.country || '', disabled: this.disabled() },
      { nonNullable: true }
    ),
  });

  public submit() {
    if (this.form.valid && this.form.value && this.form.value.name) {
      const req: LocationRequest = this.form.getRawValue();
      if (this.location()) {
        this.locationStore
          .updateLocation(this.location()!.id, req)
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
        this.locationStore
          .createLocation(this.workspaceId(), req)
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
