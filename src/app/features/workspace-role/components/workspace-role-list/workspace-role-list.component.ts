import { Component, inject, Signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ROUTER_OUTLET_DATA, RouterLink } from '@angular/router';
import { debounceTime } from 'rxjs';
import { WorkspaceRole } from '../../workspace-role';
import { WorkspaceRoleStore } from '../../workspace-role.store';
import { WorkspaceRoleDialogComponent } from '../workspace-role-dialog/workspace-role-dialog.component';

@Component({
  selector: 'app-workspace-role-list',
  imports: [
    MatProgressSpinner,
    MatButtonModule,
    MatMenuModule,
    RouterLink,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    ReactiveFormsModule
  ],
  templateUrl: './workspace-role-list.component.html',
  styleUrl: './workspace-role-list.component.scss'
})
export class WorkspaceRoleListComponent {
  private readonly matDialog = inject(MatDialog);
  public readonly WorkspaceRoleStore = inject(WorkspaceRoleStore);
  private readonly workspaceId = inject(ROUTER_OUTLET_DATA) as Signal<string>;
  

  public search = new FormControl("");
  private paginator = viewChild.required(MatPaginator);
  private sort = viewChild.required(MatSort);

  public dataSource = new MatTableDataSource<WorkspaceRole>([]);
  public displayedColumns: string[] = ['name', 'description', 'action'];

  public ngOnInit(): void {
    this.WorkspaceRoleStore.getWorkspaceRolesByWorkspaceId(this.workspaceId()).subscribe(workspaceRoles => {
      this.dataSource.data = workspaceRoles ?? [];
    });
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator();
    this.dataSource.sort = this.sort();
    this.paginator().length = this.dataSource.data.length;
    this.search.valueChanges.pipe(debounceTime(200)).subscribe(x => {
      this.dataSource.filter = x?.trim().toLowerCase() || "";
      this.dataSource.paginator?.firstPage();
      this.paginator().length = this.dataSource.data.length;
    });
  }

  public openDialog(workspaceRole?: Partial<WorkspaceRole>) {
    this.matDialog.open(WorkspaceRoleDialogComponent, { data: { workspaceId: this.workspaceId(), workspaceRole: workspaceRole}, width: '500px' }).afterClosed().subscribe(x => {
      if (x) {
        this.dataSource.data = this.WorkspaceRoleStore.workspaceRoleIdsByWorkspaceId().get(this.workspaceId())?.map(x => this.WorkspaceRoleStore.workspaceRoles().get(x)!) ?? [];
      } 
    });
  }
}
