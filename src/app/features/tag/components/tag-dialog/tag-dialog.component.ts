import { Component, computed, inject, signal } from '@angular/core';
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
import { Tag, TagForm } from '../../models/tag';
import { TagService } from '../../services/tag.service';

@Component({
  selector: 'app-tag-dialog',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatProgressSpinner,
    MatInputModule,
    MatButton,
  ],
  templateUrl: './tag-dialog.component.html',
  styleUrl: './tag-dialog.component.scss',
})
export class TagDialogComponent {
  private readonly tagService = inject(TagService);
  private readonly dialogRef = inject(MatDialogRef<TagDialogComponent>);
  private readonly matDialogData: { workspaceId: string; tag: Tag | null } =
    inject(MAT_DIALOG_DATA);
  public tag = signal<Tag | null>(this.matDialogData.tag);
  public workspaceId = this.matDialogData.workspaceId;
  public isUpdate = computed(() => !!this.tag());
  public isLoading = signal(false);

  public form = new FormGroup<TagForm>({
    name: new FormControl(
      { value: this.tag()?.name || '', disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    color: new FormControl(
      { value: this.tag()?.color || '', disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    icon: new FormControl(
      { value: this.tag()?.icon || '', disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    description: new FormControl(
      { value: this.tag()?.description || '', disabled: this.isLoading() },
      { nonNullable: true }
    ),
  });

  public async submit() {
    if (
      this.form.valid &&
      this.form.value &&
      this.form.value.name &&
      this.form.value.color &&
      this.form.value.icon
    ) {
      const tagRequest = this.form.getRawValue();
      let canClose = false;
      this.isLoading.set(true);
      if (this.tag()) {
        canClose = await this.tagService.updateTag(
          this.tag()!.id,
          this.workspaceId,
          tagRequest
        );
      } else {
        canClose = await this.tagService.createTag(
          this.workspaceId,
          tagRequest
        );
      }
      if (canClose) {
        this.dialogRef.close();
      }
      this.isLoading.set(false);
    }
  }
}
