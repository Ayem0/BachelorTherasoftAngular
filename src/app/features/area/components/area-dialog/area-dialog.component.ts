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
import { Area, AreaForm, AreaRequest } from '../../models/area';
import { AreaStore } from '../../services/area.store';

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
  private readonly areaStore = inject(AreaStore);
  private readonly dialogRef = inject(MatDialogRef<AreaDialogComponent>);
  private readonly matDialogData: {
    locationId: Signal<string>;
    area: Area | null;
  } = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  public area = signal<Area | null>(this.matDialogData.area);
  public locationId = this.matDialogData.locationId;
  public isUpdate = computed(() => !!this.area());
  public disabled = computed(
    () => this.areaStore.updating() || this.areaStore.creating()
  );

  public form = new FormGroup<AreaForm>({
    name: new FormControl(
      { value: this.area()?.name || '', disabled: this.disabled() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    description: new FormControl(
      { value: this.area()?.description || '', disabled: this.disabled() },
      { nonNullable: true }
    ),
  });

  // public form2 = this.fb.group({
  //   name: [this.area()?.description, ]
  //   description: new FormControl({ value: this.area()?.description || "", disabled: this.disabled() }),
  //   address: new FormControl({ value: this.area()?.address || "", disabled: this.disabled() }),
  //   city: new FormControl({ value: this.area()?.city || "", disabled: this.disabled() }),
  //   country: new FormControl({ value: this.area()?.country || "", disabled: this.disabled() }),
  // })

  public submit() {
    if (this.form.valid) {
      const req: AreaRequest = this.form.getRawValue();
      if (this.area()) {
        this.areaStore
          .updateArea(this.area()!.id, req)
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
        this.areaStore
          .createArea(this.locationId(), req)
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
