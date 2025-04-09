import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'app-workspace-details',
  imports: [
    MatIcon,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    RouterOutlet,
  ],
  templateUrl: './workspace-details.component.html',
  styleUrl: './workspace-details.component.scss',
})
export class WorkspaceDetailsComponent implements OnInit {
  private readonly workspaceService = inject(WorkspaceService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly routes = [
    './members',
    './locations',
    './participants',
    './participant-categories',
    './event-categories',
    './roles',
    './slots',
    './tags',
  ];

  public selectedIndex = this.routes.indexOf(
    `./${this.router.url.split('/').pop()!}`
  );
  public workspace = this.workspaceService.workspaceBySelectedId;
  public workspaceId = this.route.snapshot.paramMap.get('id');
  public isLoading = signal(true);

  public async ngOnInit() {
    if (this.workspaceId) {
      this.isLoading.set(true);
      this.workspaceService.selectedWorkspaceId.set(this.workspaceId);
      await this.workspaceService.getWorkspaceById(this.workspaceId);
      console.log(this.workspace());
      this.isLoading.set(false);
    }
  }

  public tabChanged(event: MatTabChangeEvent) {
    this.router.navigate([this.routes[event.index]], {
      relativeTo: this.route,
    });
  }
}
