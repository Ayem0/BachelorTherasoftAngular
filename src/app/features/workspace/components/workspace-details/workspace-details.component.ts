import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Workspace } from '../../workspace';
import { WorkspaceStore } from '../../workspace.store';

@Component({
    selector: 'app-workspace-details',
    imports: [
    MatIcon,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
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

  public ngOnInit(): void {
    if (this.workspaceId) this.workspaceStore.getWorkspaceById(this.workspaceId).subscribe({
      next: (workspace) => {
        this.workspace.set(workspace);
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
