import { Component, inject, OnInit, signal } from '@angular/core';
import { WorkspaceService } from '../../services/workspace.service';
import { Workspace } from '../../models/workspace';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { WorkspaceNewComponent } from '../workspace-new/workspace-new.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

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
    MatIconModule
  ],
  templateUrl: './workspace-list.component.html',
  styleUrl: './workspace-list.component.scss'
})
export class WorkspaceListComponent implements OnInit {
  private readonly matDialog = inject(MatDialog);
  private readonly workspaceService = inject(WorkspaceService);

  public workspaces = signal<Partial<Workspace>[]>([]);
  public isLoading = signal(true);

  public ngOnInit() {
    this.workspaceService.getWorkspaceByUserId().subscribe({
      next: (workspaces) => {
        this.workspaces.set(workspaces);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  public openCreateDialog() {
    const dialogRef = this.matDialog.open(WorkspaceNewComponent, { width: '500px'});

    dialogRef.afterClosed().subscribe((x?: Partial<Workspace>) => {
      if (x) {
        this.workspaces().unshift(x)
      }
    });
  }
}
