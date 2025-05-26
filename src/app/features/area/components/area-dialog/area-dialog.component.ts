import { Component, inject, signal } from '@angular/core';
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
import { AreaForm, AreaRequest } from '../../models/area';
import { AreaService } from '../../services/area.service';

@Component({
  selector: 'app-area-dialog',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatProgressSpinner,
    MatInputModule,
    MatButton,
  ],
  templateUrl: './area-dialog.component.html',
  styleUrl: './area-dialog.component.scss',
})
export class AreaDialogComponent {
  private readonly areaService = inject(AreaService);
  private readonly dialogRef = inject(MatDialogRef<AreaDialogComponent>);
  private readonly matDialogData: {
    locationId: string;
    areaId: string | undefined;
  } = inject(MAT_DIALOG_DATA);
  private areaId = this.matDialogData.areaId;
  private locationId = this.matDialogData.locationId;
  public area = this.areaService.areaById(this.matDialogData.areaId);
  public isUpdate = !!this.matDialogData.areaId;
  public isLoading = signal(false);

  public form = new FormGroup<AreaForm>({
    name: new FormControl(
      { value: this.area()?.name ?? '', disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    description: new FormControl(
      {
        value: this.area()?.description ?? undefined,
        disabled: this.isLoading(),
      },
      { nonNullable: true, validators: [Validators.maxLength(255)] }
    ),
  });

  public submit() {
    if (this.form.valid) {
      const req: AreaRequest = this.form.getRawValue();
      this.isLoading.set(true);
      const sub = this.areaId
        ? this.areaService.updateArea(this.areaId, req)
        : this.areaService.createArea(this.locationId, req);
      sub.subscribe((x) => {
        if (x) {
          this.dialogRef.close();
        }
        this.isLoading.set(false);
      });
    }
  }
}
