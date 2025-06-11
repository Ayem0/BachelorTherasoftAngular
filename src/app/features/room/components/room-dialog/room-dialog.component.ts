import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { RoomForm } from '../../models/room';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomDialogComponent {
  private readonly roomService = inject(RoomService);
  private readonly dialogRef = inject(MatDialogRef<RoomDialogComponent>);
  private readonly matDialogData: {
    areaId: string;
    roomId: string | undefined;
  } = inject(MAT_DIALOG_DATA);
  private areaId = this.matDialogData.areaId;
  private roomId = this.matDialogData.roomId;

  public room = this.roomService.roomById(this.matDialogData.roomId);
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

  public submit() {
    if (this.form.valid) {
      const req = this.form.getRawValue();
      this.isLoading.set(true);
      const sub = this.roomId
        ? this.roomService.updateRoom(this.roomId, req)
        : this.roomService.createRoom(this.areaId, req);
      sub.subscribe((x) => {
        if (x) {
          this.dialogRef.close();
        }
        this.isLoading.set(false);
      });
    }
  }
}
