import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { catchError, of, tap } from 'rxjs';
import { Workspace } from '../../workspace';
import { WorkspaceStore } from '../../workspace.store';

@Component({
    selector: 'app-workspace-dialog',
    imports: [
        MatCardModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatProgressSpinner,
        MatInputModule,
        MatButton
    ],
    templateUrl: './workspace-dialog.component.html',
    styleUrl: './workspace-dialog.component.scss'
})
export class WorkspaceDialogComponent {
  private readonly workspaceStore = inject(WorkspaceStore);
  private readonly dialogRef = inject(MatDialogRef<WorkspaceDialogComponent>);
  private readonly matDialogData = inject(MAT_DIALOG_DATA);
  public workspace = signal<Workspace | null>(this.matDialogData);
  public isUpdate = computed(() => !!this.workspace());
  public disabled = computed(() => this.workspaceStore.updating() || this.workspaceStore.creating());

  public form = new FormGroup({
    name: new FormControl({ value: this.workspace()?.name || "", disabled: this.disabled() }, [Validators.required]),
    description: new FormControl({ value: this.workspace()?.description || "", disabled: this.disabled() }),
  });

  public submit() {
    if(this.form.valid && this.form.controls.name.value) {
      if (this.workspace()?.id) {
        this.workspaceStore.updateWorkspace(this.workspace()!.id, this.form.controls.name.value, this.form.controls.description.value ?? undefined).pipe(
          tap(res => {
            this.dialogRef.close(res);
          }),
          catchError((err) => {
            console.log(err);
            return of()
          })
        ).subscribe();
      } else {
        this.workspaceStore.createWorkspace(this.form.controls.name.value, this.form.controls.description.value ?? undefined).pipe(
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
  // ngOnInit(): void {
  //   this.workspace.set(this.matDialogData);
    
  //   if (this.workspace()) {
  //     this.isUpdateMode.set(true);
  //     this.form.patchValue({
  //       name: this.workspace()?.name || '',
  //       description: this.workspace()?.description || ''
  //     });
  //   }
  // }



  //   this.isLoading.set(true);
  //   if (this.isUpdateMode()) {
  //     if(this.form.valid && this.form.controls.name.value && this.workspace()?.id) {
  //       this.workspaceService.updateWorkspace(this.workspace()!.id, this.form.controls.name.value, this.form.controls.description.value ?? undefined).subscribe({
  //         next: (workspace) => {
  //           this.isLoading.set(false);
  //           this.dialogRef.close(workspace);
  //         },
  //         error: () => {
  //           this.isLoading.set(false);
  //         }
  //       })
  //     }
  //   } else {
  //     if(this.form.valid && this.form.controls.name.value) {
  //       this.workspaceService.createWorkspace(this.form.controls.name.value, this.form.controls.description.value ?? undefined).subscribe({
  //         next: (workspace) => {
  //           this.isLoading.set(false);
  //           this.dialogRef.close(workspace);
  //         },
  //         error: () => {
  //           this.isLoading.set(false);
  //         }
  //       })
  //     }
  //   }
}
