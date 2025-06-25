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
import { Id } from '../../../../shared/models/entity';
import { TagForm } from '../../models/tag';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagDialogComponent {
  private readonly tagService = inject(TagService);
  private readonly dialogRef = inject(MatDialogRef<TagDialogComponent>);
  private readonly matDialogData: { workspaceId: Id; tagId: Id | undefined } =
    inject(MAT_DIALOG_DATA);
  private readonly workspaceId = this.matDialogData.workspaceId;
  private readonly tagId = this.matDialogData.tagId;
  public tag = this.tagService.tagById(this.matDialogData.tagId);
  public isUpdate = signal(!!this.matDialogData.tagId);
  public isLoading = signal(false);

  public form = new FormGroup<TagForm>({
    name: new FormControl(
      { value: this.tag()?.name ?? '', disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    color: new FormControl(
      { value: this.tag()?.color ?? '', disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    description: new FormControl(
      {
        value: this.tag()?.description ?? undefined,
        disabled: this.isLoading(),
      },
      { nonNullable: true }
    ),
  });

  public submit() {
    if (this.form.valid) {
      const req = this.form.getRawValue();
      this.isLoading.set(true);
      const sub = this.tagId
        ? this.tagService.updateTag(this.tagId, req)
        : this.tagService.createTag(this.workspaceId, req);
      sub.subscribe((x) => {
        if (x) {
          this.dialogRef.close();
        }
        this.isLoading.set(false);
      });
    }
  }
}
