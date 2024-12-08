import { Component, inject, OnInit } from '@angular/core';
import { Workspace } from '../../models/workspace';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { WorkspaceDialogComponent } from '../workspace-dialog/workspace-dialog.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { WorkspaceStore } from '../../store/workspace.store';

@Component({
  selector: 'app-workspace-list',
  standalone: true,
  imports: [
    MatCardModule,
    MatProgressSpinner,
    MatButtonModule,
    MatMenuModule,
    MatIcon,
    RouterLink,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltip
  ],
  templateUrl: './workspace-list.component.html',
  styleUrl: './workspace-list.component.scss',
})
export class WorkspaceListComponent implements OnInit {
  private readonly matDialog = inject(MatDialog);
  public readonly workspaceStore = inject(WorkspaceStore);

  public ngOnInit(): void {
    this.workspaceStore.getWorkspaces();
  }

  public openDialog(workspace?: Partial<Workspace>) {
    this.matDialog.open(WorkspaceDialogComponent, { data: workspace, width: '500px' });
  }
}
