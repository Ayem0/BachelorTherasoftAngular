import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { catchError, of, tap } from 'rxjs';
import { Tag } from '../../tag';
import { TagStore } from '../../tag.store';

@Component({
  selector: 'app-tag-dialog',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatProgressSpinner,
    MatInputModule,
    MatButton
  ],
  templateUrl: './tag-dialog.component.html',
  styleUrl: './tag-dialog.component.scss'
})
export class TagDialogComponent {
  private readonly tagStore = inject(TagStore);
  private readonly dialogRef = inject(MatDialogRef<TagDialogComponent>);
  private readonly matDialogData : { workspaceId: string, tag: Tag | null } = inject(MAT_DIALOG_DATA);
  public tag = signal<Tag | null>(this.matDialogData.tag);
  public workspaceId = this.matDialogData.workspaceId;
  public isUpdate = computed(() => !!this.tag());
  public disabled = computed(() => this.tagStore.updating() || this.tagStore.creating());


  public form = new FormGroup({
    name: new FormControl({ value: this.tag()?.name || "", disabled: this.disabled() }, [Validators.required]),
    color: new FormControl({ value: this.tag()?.color || "", disabled: this.disabled() }, [Validators.required]),
    icon: new FormControl({ value: this.tag()?.icon || "", disabled: this.disabled() }, [Validators.required]),
    description: new FormControl({ value: this.tag()?.description || "", disabled: this.disabled() }),
  });

  public submit() {
    if(this.form.valid && this.form.value && this.form.value.name && this.form.value.color && this.form.value.icon) {
      const { name, color, icon, description } = this.form.value;
      if (this.tag()) {
        this.tagStore.updateTag(
          this.workspaceId, 
          this.tag()!.id, 
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
        this.tagStore.createTag(
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
