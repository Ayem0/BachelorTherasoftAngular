import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { User } from '../../../../core/auth/models/auth';
import { Workspace } from '../../workspace';
import { WorkspaceService } from '../../workspace.service';
import { LocationListComponent } from "../../../location/components/location-list/location-list.component";

@Component({
    selector: 'app-workspace-details',
    imports: [
    MatIcon,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    LocationListComponent
],
    templateUrl: './workspace-details.component.html',
    styleUrl: './workspace-details.component.scss'
})
export class WorkspaceDetailsComponent implements OnInit {
  private readonly workspaceService = inject(WorkspaceService);
  private readonly route = inject(ActivatedRoute);
  
  public workspace = signal<Workspace | null>(null);
  public workspaceId = this.route.snapshot.paramMap.get('id');
  public isLoading = signal(true);
  public displayedColumns: string[] = ['firstName', 'lastName'];
  public users = new MatTableDataSource<Partial<User>>([]);

  public ngOnInit(): void {
    if (this.workspaceId) this.workspaceService.getWorkspaceDetailsById(this.workspaceId).subscribe({
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
