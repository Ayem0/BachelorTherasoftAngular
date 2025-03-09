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
import { catchError, of, tap } from 'rxjs';
import { WorkspaceRole, WorkspaceRoleForm } from '../../workspace-role';
import { WorkspaceRoleStore } from '../../workspace-role.store';

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
  private readonly workspaceRoleStore = inject(WorkspaceRoleStore);
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
  public workspaceId = this.matDialogData.workspaceId;
  public isUpdate = computed(() => !!this.workspaceRole());
  public disabled = computed(
    () =>
      this.workspaceRoleStore.updating() || this.workspaceRoleStore.creating()
  );

  public form = new FormGroup<WorkspaceRoleForm>({
    name: new FormControl<string>(
      { value: this.workspaceRole()?.name || '', disabled: this.disabled() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    description: new FormControl<string | undefined>(
      {
        value: this.workspaceRole()?.description || '',
        disabled: this.disabled(),
      },
      { nonNullable: true }
    ),
  });

  public submit() {
    if (this.form.valid && this.form.value && this.form.value.name) {
      const req = this.form.getRawValue();
      if (this.workspaceRole()) {
        this.workspaceRoleStore
          .updateWorkspaceRole(this.workspaceRole()!.id, req)
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
        this.workspaceRoleStore
          .createWorkspaceRole(req)
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
