import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { User } from '../../../../core/auth/models/auth';
import { Workspace } from '../../workspace';
import { WorkspaceStore } from '../../workspace.store';

@Component({
    selector: 'app-workspace-details',
    imports: [
    MatIcon,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    // MatPaginatorModule,
    // LocationListComponent,
    // ParticipantListComponent,
    // ParticipantCategoryListComponent,
    RouterOutlet
],
    templateUrl: './workspace-details.component.html',
    styleUrl: './workspace-details.component.scss'
})
export class WorkspaceDetailsComponent implements OnInit {
  private readonly workspaceStore = inject(WorkspaceStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private routes = [
    './members',
    './locations',
    './participants',
    './participant-categories',
    './event-categories',
    './roles',
    './slots',
    './tags'
  ];

  public selectedIndex = this.routes.indexOf(`./${this.router.url.split('/').pop()!}`);
  public workspace = signal<Workspace | null>(null);
  public workspaceId = this.route.snapshot.paramMap.get('id');
  public isLoading = signal(true);
  public displayedColumns: string[] = ['firstName', 'lastName'];
  public users = new MatTableDataSource<Partial<User>>([]);

  public ngOnInit(): void {
    if (this.workspaceId) this.workspaceStore.getWorkspaceDetailsById(this.workspaceId).subscribe({
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

  public tabChanged(event: MatTabChangeEvent) {
    this.router.navigate([this.routes[event.index]], { relativeTo: this.route });
  }
}
