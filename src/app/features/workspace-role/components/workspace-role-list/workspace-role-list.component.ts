import {
  AfterViewInit,
  Component,
  effect,
  inject,
  OnInit,
  signal,
  Signal,
  viewChild,
} from '@angular/core';
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
import { WorkspaceRole } from '../../models/workspace-role';
import { WorkspaceRoleService } from '../../services/workspace-role.service';
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
    ReactiveFormsModule,
  ],
  templateUrl: './workspace-role-list.component.html',
  styleUrl: './workspace-role-list.component.scss',
})
export class WorkspaceRoleListComponent implements OnInit, AfterViewInit {
  private readonly matDialog = inject(MatDialog);
  private readonly workspaceRoleService = inject(WorkspaceRoleService);
  private readonly workspaceId = inject(ROUTER_OUTLET_DATA) as Signal<string>;
  private paginator = viewChild.required(MatPaginator);
  private sort = viewChild.required(MatSort);

  public search = new FormControl('');
  public isLoading = signal(false);
  public dataSource = new MatTableDataSource<WorkspaceRole>([]);
  public displayedColumns: string[] = ['name', 'description', 'action'];

  constructor() {
    effect(() => {
      this.dataSource.data =
        this.workspaceRoleService.workspaceRolesBySelectedWorkspaceId();
      if (this.paginator && this.paginator()) {
        this.paginator().length = this.dataSource.data.length;
      }
    });
  }

  public async ngOnInit() {
    this.workspaceRoleService.selectedWorkspaceId.set(this.workspaceId());
    this.isLoading.set(true);
    await this.workspaceRoleService.getWorkspaceRolesByWorkspaceId(
      this.workspaceId()
    );
    this.isLoading.set(false);
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator();
    this.dataSource.sort = this.sort();
    this.search.valueChanges
      .pipe(debounceTime(200))
      .subscribe((searchValue) => {
        this.dataSource.filter = searchValue?.trim().toLowerCase() || '';
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
        this.paginator().length = this.dataSource.filteredData.length;
      });
  }

  public openDialog(workspaceRole?: Partial<WorkspaceRole>) {
    this.matDialog.open(WorkspaceRoleDialogComponent, {
      data: { workspaceId: this.workspaceId(), workspaceRole: workspaceRole },
      width: '500px',
    });
  }
}
