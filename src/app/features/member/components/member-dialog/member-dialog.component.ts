import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { catchError, of, tap } from 'rxjs';
import { WorkspaceRole } from '../../../workspace-role/workspace-role';
import { WorkspaceRoleStore } from '../../../workspace-role/workspace-role.store';
import { Member } from '../../member';
import { MemberStore } from '../../member.store';

@Component({
  selector: 'app-member-dialog',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatProgressSpinner,
    MatInputModule,
    MatButton,
    MatSelectModule
  ],
  templateUrl: './member-dialog.component.html',
  styleUrl: './member-dialog.component.scss'
})
export class MemberDialogComponent implements OnInit {
  private readonly workspaceRoleStore = inject(WorkspaceRoleStore);
  private readonly memberStore = inject(MemberStore);
  private readonly dialogRef = inject(MatDialogRef<MemberDialogComponent>);
  private readonly matDialogData : { workspaceId: string, Member: Member } = inject(MAT_DIALOG_DATA);
  
  public member = signal(this.matDialogData.Member);
  private readonly workspaceId = this.matDialogData.workspaceId;
  public disabled = computed(() => this.memberStore.updating());

  public workspaceRoles = signal<WorkspaceRole[]>([]);

  public form = new FormGroup({
    roles: new FormControl({ value: this.member().workspaceRoleIds, disabled: this.disabled() }, [Validators.required]),
  });

  public ngOnInit(): void {
    this.workspaceRoleStore.getWorkspaceRolesByWorkspaceId(this.workspaceId).subscribe(res => this.workspaceRoles.set(res))
  }

  public submit() {
    if(this.form.valid && this.form.value) {
      const { roles } = this.form.value;
        this.memberStore.updateMember(
          this.workspaceId, 
          this.member().id, 
          roles ?? []
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
