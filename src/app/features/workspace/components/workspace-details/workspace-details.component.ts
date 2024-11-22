import { Component, inject, OnInit, signal } from '@angular/core';
import { WorkspaceService } from '../../services/workspace.service';
import { Workspace } from '../../models/workspace';
import { ActivatedRoute } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { User } from '../../../../core/auth/models/auth';

@Component({
  selector: 'app-workspace-details',
  standalone: true,
  imports: [
    MatIcon,
    MatButtonModule,
    MatTabsModule,
    MatTableModule, 
    MatPaginatorModule
  ],
  templateUrl: './workspace-details.component.html',
  styleUrl: './workspace-details.component.scss'
})
export class WorkspaceDetailsComponent implements OnInit {
  private readonly workspaceService = inject(WorkspaceService);
  private readonly route = inject(ActivatedRoute);
  
  public workspace = signal<Workspace | null>(null);
  public isLoading = signal(true);
  public displayedColumns: string[] = ['firstName', 'lastName'];
  public users = new MatTableDataSource<Partial<User>>([]);

  public ngOnInit(): void {
    const workspaceId = this.route.snapshot.paramMap.get('id');
    if (workspaceId) this.workspaceService.getWorkspaceDetailsById(workspaceId).subscribe({
      next: (workspace) => {
        this.workspace.set(workspace);
        this.users.data = workspace.users;
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    })
  }
}
