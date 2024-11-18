import { Component, inject, OnInit, signal } from '@angular/core';
import { WorkspaceService } from '../../services/workspace.service';
import { Workspace } from '../../models/workspace';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-workspace-list',
  standalone: true,
  imports: [
    MatCardModule,
    MatProgressSpinner,
    MatButtonModule,
    MatMenuModule,
    MatIcon,
    RouterLink
  ],
  templateUrl: './workspace-list.component.html',
  styleUrl: './workspace-list.component.scss'
})
export class WorkspaceListComponent implements OnInit {

  private readonly workspaceService = inject(WorkspaceService);

  public workspaces = signal<Workspace[]>([]);
  public isLoading = signal(true);

  public async ngOnInit() {
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
}
