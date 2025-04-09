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
import { WorkspaceRole, WorkspaceRoleForm } from '../../models/workspace-role';
import { WorkspaceRoleService } from '../../services/workspace-role.service';

@Component({
  selector: 'app-workspace-role-dialog',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatProgressSpinner,
    MatInputModule,
    MatButton,
  ],
  templateUrl: './workspace-role-dialog.component.html',
  styleUrl: './workspace-role-dialog.component.scss',
})
export class WorkspaceRoleDialogComponent {
  private readonly workspaceRoleService = inject(WorkspaceRoleService);
  private readonly dialogRef = inject(
    MatDialogRef<WorkspaceRoleDialogComponent>
  );
  private readonly matDialogData: {
    workspaceId: string;
    workspaceRole: WorkspaceRole | null;
  } = inject(MAT_DIALOG_DATA);
  public workspaceRole = signal<WorkspaceRole | null>(
    this.matDialogData.workspaceRole
  );
  private readonly workspaceId = this.matDialogData.workspaceId;
  public isUpdate = computed(() => !!this.workspaceRole());
  public isLoading = signal(false);

  public form = new FormGroup<WorkspaceRoleForm>({
    name: new FormControl<string>(
      { value: this.workspaceRole()?.name || '', disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    description: new FormControl<string | undefined>(
      {
        value: this.workspaceRole()?.description || '',
        disabled: this.isLoading(),
      },
      { nonNullable: true }
    ),
  });

  public async submit() {
    if (this.form.valid && this.form.value && this.form.value.name) {
      const req = this.form.getRawValue();
      let canClose = true;
      this.isLoading.set(true);
      if (this.workspaceRole()) {
        canClose = await this.workspaceRoleService.updateWorkspaceRole(
          this.workspaceRole()!.id,
          this.workspaceId,
          req
        );
      } else {
        canClose = await this.workspaceRoleService.createWorkspaceRole(
          this.workspaceId,
          req
        );
      }
      if (canClose) {
        this.dialogRef.close();
      }
      this.isLoading.set(false);
    }
  }
}
