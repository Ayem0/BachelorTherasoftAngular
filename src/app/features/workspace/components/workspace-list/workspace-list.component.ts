import { AfterViewInit, Component, inject, OnInit, ViewChild, viewChild } from '@angular/core';
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
import { WorkspaceStore } from '../../store/workspace.store';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { debounceTime } from 'rxjs';

@Component({
    selector: 'app-workspace-list',
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
    templateUrl: './workspace-list.component.html',
    styleUrl: './workspace-list.component.scss'
})
export class WorkspaceListComponent implements OnInit, AfterViewInit {
  private readonly matDialog = inject(MatDialog);
  public readonly workspaceStore = inject(WorkspaceStore);

  private paginator = viewChild.required(MatPaginator);
  private sort = viewChild.required(MatSort);

  public search = new FormControl("");

  public dataSource = new MatTableDataSource<Workspace>([]);
  public displayedColumns: string[] = ['name', 'description', 'action'];

  public ngOnInit(): void {
    this.workspaceStore.getWorkspaces().subscribe(workspaces => {
      this.dataSource.data = this.workspaceStore.workspaces();
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

  public openDialog(workspace?: Partial<Workspace>) {
    this.matDialog.open(WorkspaceDialogComponent, { data: workspace, width: '500px' }).afterClosed().subscribe(x => {
      if (x) {
        this.dataSource.data = this.workspaceStore.workspaces();
      } 
    });
  }
}
