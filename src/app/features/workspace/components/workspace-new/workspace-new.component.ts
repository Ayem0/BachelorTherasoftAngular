import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { WorkspaceService } from '../../services/workspace.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-workspace-new',
  standalone: true,
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatProgressSpinner,
    MatInputModule,
    MatButton
  ],
  templateUrl: './workspace-new.component.html',
  styleUrl: './workspace-new.component.scss'
})
export class WorkspaceNewComponent {
  private readonly workspaceService = inject(WorkspaceService);
  private readonly dialogRef = inject(MatDialogRef<WorkspaceNewComponent>);

  public isLoading = signal(false);
  public createForm = new FormGroup({
    name: new FormControl({ value: "", disabled: this.isLoading() }, [Validators.required]),
    description: new FormControl({ value: "", disabled: this.isLoading() }),
  });

  public submit() {
    this.isLoading.set(true);
    if(this.createForm.valid && this.createForm.controls.name.value) {
      this.workspaceService.createWorkspace(this.createForm.controls.name.value, this.createForm.controls.description.value ?? undefined).subscribe({
        next: (workspace) => {
          this.isLoading.set(false);
          this.dialogRef.close(workspace);
        },
        error: () => {
          this.isLoading.set(false);
        }
      })
    }
  }
}
