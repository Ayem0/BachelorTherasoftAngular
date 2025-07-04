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
import { WorkspaceForm } from '../../models/workspace';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'app-workspace-dialog',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatProgressSpinner,
    MatInputModule,
    MatButton,
  ],
  templateUrl: './workspace-dialog.component.html',
  styleUrl: './workspace-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceDialogComponent {
  private readonly workspaceService = inject(WorkspaceService);
  private readonly dialogRef = inject(MatDialogRef<WorkspaceDialogComponent>);
  private readonly workspaceId: string = inject(MAT_DIALOG_DATA);

  public workspace = this.workspaceService.workspaceById(this.workspaceId);
  public isUpdate = computed(() => !!this.workspace());
  public isLoading = signal(false);
  public form = new FormGroup<WorkspaceForm>({
    name: new FormControl<string>(
      { value: this.workspace()?.name ?? '', disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    color: new FormControl<string>(
      { value: this.workspace()?.color ?? '', disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    description: new FormControl<string | undefined>(
      {
        value: this.workspace()?.description ?? undefined,
        disabled: this.isLoading(),
      },
      { nonNullable: true }
    ),
  });

  public submit() {
    if (this.form.valid && this.form.controls.name.value) {
      const req = this.form.getRawValue();
      this.isLoading.set(true);
      const sub = this.workspaceId
        ? this.workspaceService.updateWorkspace(this.workspaceId, req)
        : this.workspaceService.createWorkspace(req);
      sub.subscribe((canClose) => {
        if (canClose) {
          this.dialogRef.close();
        }
        this.isLoading.set(false);
      });
    }
  }
}
