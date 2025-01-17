import { Component, computed, inject, Signal, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { catchError, of, tap } from 'rxjs';
import { Place } from '../../location';
import { LocationStore } from '../../location.store';

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
  private readonly locationStore = inject(LocationStore);
  private readonly dialogRef = inject(MatDialogRef<LocationDialogComponent>);
  private readonly matDialogData : { workspaceId: Signal<string>, location: Place | null } = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  public location = signal<Place | null>(this.matDialogData.location);
  public workspaceId = this.matDialogData.workspaceId;
  public isUpdate = computed(() => !!this.location());
  public disabled = computed(() => this.locationStore.updating() || this.locationStore.creating());

  public form = new FormGroup({
    name: new FormControl({ value: this.location()?.name || "", disabled: this.disabled() }, [Validators.required]),
    description: new FormControl({ value: this.location()?.description || "", disabled: this.disabled() }),
    address: new FormControl({ value: this.location()?.address || "", disabled: this.disabled() }),
    city: new FormControl({ value: this.location()?.city || "", disabled: this.disabled() }),
    country: new FormControl({ value: this.location()?.country || "", disabled: this.disabled() }),
  });

  // public form2 = this.fb.group({
  //   name: [this.location()?.description, ]
  //   description: new FormControl({ value: this.location()?.description || "", disabled: this.disabled() }),
  //   address: new FormControl({ value: this.location()?.address || "", disabled: this.disabled() }),
  //   city: new FormControl({ value: this.location()?.city || "", disabled: this.disabled() }),
  //   country: new FormControl({ value: this.location()?.country || "", disabled: this.disabled() }),
  // })

  public submit() {
    if(this.form.valid && this.form.value && this.form.value.name) {
      const { name, description, address, city, country } = this.form.value;
      if (this.location()) {
        this.locationStore.updateLocation(this.workspaceId(), this.location()!.id, name, description ?? undefined).pipe(
          tap(res => {
            this.dialogRef.close(res);
          }),
          catchError((err) => {
            console.log(err);
            return of()
          })
        ).subscribe();
      } else {
        this.locationStore.createLocation(this.workspaceId(), name, description ?? undefined, address ?? undefined, city ?? undefined, country ?? undefined).pipe(
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
