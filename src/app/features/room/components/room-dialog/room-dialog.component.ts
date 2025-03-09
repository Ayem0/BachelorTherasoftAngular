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
import { Room, RoomForm } from '../../room';
import { RoomStore } from '../../room.store';

@Component({
  selector: 'app-room-dialog',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatProgressSpinner,
    MatInputModule,
    MatButton,
  ],
  templateUrl: './room-dialog.component.html',
  styleUrl: './room-dialog.component.scss',
})
export class RoomDialogComponent {
  private readonly roomStore = inject(RoomStore);
  private readonly dialogRef = inject(MatDialogRef<RoomDialogComponent>);
  private readonly matDialogData: {
    areaId: Signal<string>;
    room: Room | null;
  } = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  public room = signal<Room | null>(this.matDialogData.room);
  public areaId = this.matDialogData.areaId;
  public isUpdate = computed(() => !!this.room());
  public disabled = computed(
    () => this.roomStore.isUpdating() || this.roomStore.isCreating()
  );

  public form = new FormGroup<RoomForm>({
    name: new FormControl(
      { value: this.room()?.name || '', disabled: this.disabled() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    description: new FormControl(
      { value: this.room()?.description || '', disabled: this.disabled() },
      { nonNullable: true }
    ),
  });

  public submit() {
    if (this.form.valid && this.form.value && this.form.value.name) {
      const roomRequest = this.form.getRawValue();
      if (this.room()) {
        this.roomStore
          .updateRoom(this.room()!.id, roomRequest)
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
        this.roomStore
          .createRoom(this.areaId(), roomRequest)
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
