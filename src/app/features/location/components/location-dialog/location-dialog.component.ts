import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
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
import { LocationForm, LocationRequest } from '../../models/location';
import { LocationService } from '../../services/location.service';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationDialogComponent {
  private readonly locationService = inject(LocationService);
  private readonly dialogRef = inject(MatDialogRef<LocationDialogComponent>);
  private readonly matDialogData: {
    workspaceId: string;
    locationId: string | undefined;
  } = inject(MAT_DIALOG_DATA);

  private locationId = this.matDialogData.locationId;
  private workspaceId = this.matDialogData.workspaceId;
  private location = this.locationService.locationById(this.locationId);
  public isUpdate = !!this.locationId;
  public isLoading = signal(false);

  public form = new FormGroup<LocationForm>({
    name: new FormControl(
      { value: this.location()?.name ?? '', disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    description: new FormControl(
      { value: this.location()?.description, disabled: this.isLoading() },
      { nonNullable: true }
    ),
    address: new FormControl(
      { value: this.location()?.address, disabled: this.isLoading() },
      { nonNullable: true }
    ),
    city: new FormControl(
      { value: this.location()?.city, disabled: this.isLoading() },
      { nonNullable: true }
    ),
    country: new FormControl(
      { value: this.location()?.country, disabled: this.isLoading() },
      { nonNullable: true }
    ),
  });

  public submit(): void {
    if (this.form.valid && this.form.value && this.form.value.name) {
      const req: LocationRequest = this.form.getRawValue();
      this.isLoading.set(true);
      const sub = this.locationId
        ? this.locationService.updateLocation(this.locationId, req)
        : this.locationService.createLocation(this.workspaceId, req);
      sub.subscribe((x) => {
        if (x) {
          this.dialogRef.close();
        }
        this.isLoading.set(false);
      });
    }
  }
}
