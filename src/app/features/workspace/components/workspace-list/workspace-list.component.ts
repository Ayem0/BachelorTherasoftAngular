import {
  AfterViewInit,
  Component,
  computed,
  inject,
  OnInit,
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
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { debounceTime } from 'rxjs';
import { Workspace } from '../../workspace';
import { WorkspaceStore } from '../../workspace.store';
import { WorkspaceDialogComponent } from '../workspace-dialog/workspace-dialog.component';

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
    ReactiveFormsModule,
  ],
  templateUrl: './workspace-list.component.html',
  styleUrl: './workspace-list.component.scss',
})
export class WorkspaceListComponent implements OnInit, AfterViewInit {
  private readonly matDialog = inject(MatDialog);
  public readonly workspaceStore = inject(WorkspaceStore);

  public search = new FormControl('');
  private paginator = viewChild.required(MatPaginator);
  private sort = viewChild.required(MatSort);

  public dataSource = this.workspaceStore.workspaceDataSource;
  public dataSourceLength = computed(
    () => this.dataSource().filteredData.length
  );
  public displayedColumns: string[] = ['name', 'description', 'action'];

  public ngOnInit(): void {
    this.workspaceStore.getWorkspaces();
  }

  public ngAfterViewInit(): void {
    this.dataSource().paginator = this.paginator();
    this.dataSource().sort = this.sort();
    this.paginator().length = this.dataSource().data.length;
    this.search.valueChanges.pipe(debounceTime(200)).subscribe((x) => {
      this.dataSource().filter = x?.trim().toLowerCase() || '';
      this.dataSource().paginator?.firstPage();
      this.paginator().length = this.dataSource().data.length;
    });
  }

  public openDialog(workspace?: Partial<Workspace>) {
    this.matDialog.open(WorkspaceDialogComponent, {
      data: workspace,
      width: '500px',
    });
  }
}
