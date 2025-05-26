import { Component, inject, signal } from '@angular/core';
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
import { WorkspaceRoleForm } from '../../models/workspace-role';
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
    workspaceRoleId: string | undefined;
  } = inject(MAT_DIALOG_DATA);
  private workspaceId = this.matDialogData.workspaceId;
  private workspaceRoleId = this.matDialogData.workspaceRoleId;
  private workspaceRole = this.workspaceRoleService.workspaceRoleById(
    this.matDialogData.workspaceRoleId
  );
  public isUpdate = signal(!!this.matDialogData.workspaceRoleId);
  public isLoading = signal(false);

  public form = new FormGroup<WorkspaceRoleForm>({
    name: new FormControl<string>(
      { value: this.workspaceRole()?.name ?? '', disabled: this.isLoading() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    description: new FormControl<string | undefined>(
      {
        value: this.workspaceRole()?.description ?? undefined,
        disabled: this.isLoading(),
      },
      { nonNullable: true }
    ),
  });

  public submit() {
    if (this.form.valid) {
      const req = this.form.getRawValue();
      this.isLoading.set(true);
      const sub = this.workspaceRoleId
        ? this.workspaceRoleService.updateWorkspaceRole(
            this.workspaceRoleId,
            req
          )
        : this.workspaceRoleService.createWorkspaceRole(this.workspaceId, req);
      sub.subscribe((x) => {
        if (x) {
          this.dialogRef.close();
        }
        this.isLoading.set(false);
      });
    }
  }
}
