import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { debounceTime } from 'rxjs';
import { Id } from '../../../../shared/models/entity';
import { Workspace } from '../../models/workspace';
import { WorkspaceService } from '../../services/workspace.service';
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
    MatCardModule,
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        subscriptSizing: 'dynamic',
      },
    },
  ],
  templateUrl: './workspace-list.component.html',
  styleUrl: './workspace-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceListComponent implements OnInit, AfterViewInit {
  private readonly matDialog = inject(MatDialog);
  private readonly workspaceService = inject(WorkspaceService);
  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);

  public search = new FormControl('');
  public isLoading = signal(false);
  public dataSource = new MatTableDataSource<Workspace>([]);
  public displayedColumns: string[] = [
    'name',
    'color',
    'description',
    'action',
  ];
  public workspaces = this.workspaceService.workspaces();

  constructor() {
    effect(() => {
      this.dataSource.data = this.workspaces();
      if (this.paginator())
        this.paginator()!.length = this.dataSource.data.length;
    });
  }

  public ngOnInit() {
    this.isLoading.set(true);
    this.workspaceService
      .getWorkspaces()
      .subscribe(() => this.isLoading.set(false));
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator() ?? null;
    this.dataSource.sort = this.sort() ?? null;
    if (this.paginator())
      this.paginator()!.length = this.dataSource.data.length;
    this.search.valueChanges.pipe(debounceTime(200)).subscribe((x) => {
      this.dataSource.filter = x?.trim().toLowerCase() || '';
      this.dataSource.paginator?.firstPage();
      if (this.paginator())
        this.paginator()!.length = this.dataSource.data.length;
    });
  }

  public openDialog(workspaceId?: Id) {
    this.matDialog.open(WorkspaceDialogComponent, {
      data: workspaceId,
      width: '500px',
    });
  }
}
