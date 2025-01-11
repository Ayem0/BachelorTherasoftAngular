import { Component, computed, inject, signal } from '@angular/core';
import { locationStore } from '../../location.store';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { tap, catchError, of } from 'rxjs';
import { Place } from '../../location';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-location-dialog',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatProgressSpinner,
    MatInputModule,
    MatButton
  ],
  templateUrl: './location-dialog.component.html',
  styleUrl: './location-dialog.component.scss'
})
export class LocationDialogComponent {
  readonly locationStore = inject(locationStore);
  private readonly dialogRef = inject(MatDialogRef<LocationDialogComponent>);
  private readonly matDialogData : { workspaceId: string, location: Place | null } = inject(MAT_DIALOG_DATA);
  public location = signal<Place | null>(this.matDialogData.location);
  public workspaceId = this.matDialogData.workspaceId;
  public isUpdate = computed(() => !!this.location());

  public form = new FormGroup({
    name: new FormControl({ value: this.location()?.name || "", disabled: this.locationStore.updating() || this.locationStore.creating() }, [Validators.required]),
    description: new FormControl({ value: this.location()?.description || "", disabled: this.locationStore.updating() || this.locationStore.creating() }),
    address: new FormControl({ value: this.location()?.address || "", disabled: this.locationStore.updating() || this.locationStore.creating() }),
    city: new FormControl({ value: this.location()?.city || "", disabled: this.locationStore.updating() || this.locationStore.creating() }),
    country: new FormControl({ value: this.location()?.country || "", disabled: this.locationStore.updating() || this.locationStore.creating() }),
  });

  public submit() {
    if(this.form.valid && this.form.value && this.form.value.name) {
      const { name, description, address, city, country } = this.form.value;
      if (this.location()) {
        this.locationStore.updateLocation(this.workspaceId, this.location()!.id, name, description ?? undefined).pipe(
          tap(res => {
            this.dialogRef.close(res);
          }),
          catchError((err) => {
            console.log(err);
            return of()
          })
        ).subscribe();
      } else {
        this.locationStore.createLocation(this.workspaceId, name, description ?? undefined, address ?? undefined, city ?? undefined, country ?? undefined).pipe(
          tap(res => {
            this.dialogRef.close(res);
          }),
          catchError((err) => {
            console.log(err);
            return of()
          })
        ).subscribe();
      }
    }
  }
}
