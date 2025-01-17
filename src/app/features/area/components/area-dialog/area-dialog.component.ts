import { Component, computed, inject, Signal, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { catchError, of, tap } from 'rxjs';
import { Area } from '../../area';
import { AreaStore } from '../../area.store';

@Component({
  selector: 'app-area-dialog',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatProgressSpinner,
    MatInputModule,
    MatButton
  ],
  templateUrl: './area-dialog.component.html',
  styleUrl: './area-dialog.component.scss'
})
export class AreaDialogComponent {
  private readonly areaStore = inject(AreaStore);
  private readonly dialogRef = inject(MatDialogRef<AreaDialogComponent>);
  private readonly matDialogData : { workspaceId: Signal<string>, area: Area | null } = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  public area = signal<Area | null>(this.matDialogData.area);
  public workspaceId = this.matDialogData.workspaceId;
  public isUpdate = computed(() => !!this.area());
  public disabled = computed(() => this.areaStore.updating() || this.areaStore.creating());

  public form = new FormGroup({
    name: new FormControl({ value: this.area()?.name || "", disabled: this.disabled() }, [Validators.required]),
    description: new FormControl({ value: this.area()?.description || "", disabled: this.disabled() }),
  });

  // public form2 = this.fb.group({
  //   name: [this.area()?.description, ]
  //   description: new FormControl({ value: this.area()?.description || "", disabled: this.disabled() }),
  //   address: new FormControl({ value: this.area()?.address || "", disabled: this.disabled() }),
  //   city: new FormControl({ value: this.area()?.city || "", disabled: this.disabled() }),
  //   country: new FormControl({ value: this.area()?.country || "", disabled: this.disabled() }),
  // })

  public submit() {
    if(this.form.valid && this.form.value && this.form.value.name) {
      const { name, description } = this.form.value;
      if (this.area()) {
        this.areaStore.updateArea(this.workspaceId(), this.area()!.id, name, description ?? undefined).pipe(
          tap(res => {
            this.dialogRef.close(res);
          }),
          catchError((err) => {
            console.log(err);
            return of()
          })
        ).subscribe();
      } else {
        this.areaStore.createArea(this.workspaceId(), name, description ?? undefined).pipe(
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
