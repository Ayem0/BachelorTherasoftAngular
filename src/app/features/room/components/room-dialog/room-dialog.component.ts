import { Component, computed, inject, Signal, signal } from '@angular/core';
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
import { Room, RoomForm } from '../../models/room';
import { RoomService } from '../../services/room.service';

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
  private readonly roomService = inject(RoomService);
  private readonly dialogRef = inject(MatDialogRef<RoomDialogComponent>);
  private readonly matDialogData: {
    areaId: Signal<string>;
    room: Room | null;
  } = inject(MAT_DIALOG_DATA);

  public room = signal<Room | null>(this.matDialogData.room);
  public areaId = this.matDialogData.areaId;
  public isUpdate = computed(() => !!this.room());
  public isLoading = signal(false);

  public form = new FormGroup<RoomForm>({
    name: new FormControl(
      { value: this.room()?.name || '', disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    description: new FormControl(
      { value: this.room()?.description || '', disabled: this.isLoading() },
      { nonNullable: true }
    ),
  });

  public async submit() {
    if (this.form.valid && this.form.value && this.form.value.name) {
      const roomRequest = this.form.getRawValue();
      this.isLoading.set(true);
      let canClose = false;
      if (this.room()) {
        canClose = await this.roomService.updateRoom(
          this.room()!.id,
          roomRequest
        );
      } else {
        canClose = await this.roomService.createRoom(
          this.areaId(),
          roomRequest
        );
      }
      if (canClose) {
        this.dialogRef.close();
      }
      this.isLoading.set(false);
    }
  }
}
