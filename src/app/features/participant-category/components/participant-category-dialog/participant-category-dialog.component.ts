import { Component, computed, inject, signal } from '@angular/core';
import { ParticipantCategoryStore } from '../../participant-category.store';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { tap, catchError, of, first } from 'rxjs';
import { ParticipantCategory } from '../../participant-category';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-participant-dialog',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatProgressSpinner,
    MatInputModule,
    MatButton
  ],
  templateUrl: './participant-dialog.component.html',
  styleUrl: './participant-dialog.component.scss'
})
export class ParticipantCategoryDialogComponent {
  readonly participantCategoryStore = inject(ParticipantCategoryStore);
  private readonly dialogRef = inject(MatDialogRef<ParticipantCategoryDialogComponent>);
  private readonly matDialogData : { workspaceId: string, participantCategory: ParticipantCategory | null } = inject(MAT_DIALOG_DATA);
  public participantCategory = signal<ParticipantCategory | null>(this.matDialogData.participantCategory);
  public workspaceId = this.matDialogData.workspaceId;
  public isUpdate = computed(() => !!this.participantCategory());

  public form = new FormGroup({
    name: new FormControl({ value: this.participantCategory()?.name || "", disabled: this.participantCategoryStore.updating() || this.participantCategoryStore.creating() }, [Validators.required]),
    color: new FormControl({ value: this.participantCategory()?.color || "", disabled: this.participantCategoryStore.updating() || this.participantCategoryStore.creating() }, [Validators.required]),
    icon: new FormControl({ value: this.participantCategory()?.icon || "", disabled: this.participantCategoryStore.updating() || this.participantCategoryStore.creating() }, [Validators.required]),
    description: new FormControl({ value: this.participantCategory()?.description || "", disabled: this.participantCategoryStore.updating() || this.participantCategoryStore.creating() }),
  });

  public submit() {
    if(this.form.valid && this.form.value && this.form.value.name && this.form.value.color && this.form.value.icon) {
      const { name, color, icon, description } = this.form.value;
      if (this.participantCategory()) {
        this.participantCategoryStore.updateParticipantCategory(
          this.workspaceId, 
          this.participantCategory()!.id, 
          name, 
          color, 
          icon,
          description ?? undefined
        ).pipe(
          tap(res => {
            this.dialogRef.close(res);
          }),
          catchError((err) => {
            console.log(err);
            return of()
          })
        ).subscribe();
      } else {
        this.participantCategoryStore.createParticipantCategory(
          this.workspaceId,
          name, 
          color, 
          icon,
          description ?? undefined
        ).pipe(
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
