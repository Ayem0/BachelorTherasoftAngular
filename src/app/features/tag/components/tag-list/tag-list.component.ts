import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
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
import { Id } from '../../../../shared/models/entity';
import { Tag } from '../../models/tag';
import { TagService } from '../../services/tag.service';
import { TagDialogComponent } from '../tag-dialog/tag-dialog.component';

@Component({
  selector: 'app-tag-list',
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
  templateUrl: './tag-list.component.html',
  styleUrl: './tag-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagListComponent {
  private readonly matDialog = inject(MatDialog);
  private readonly tagService = inject(TagService);
  private readonly workspaceId = inject(ROUTER_OUTLET_DATA) as Signal<string>;
  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);

  public search = new FormControl('');
  public isLoading = signal(false);
  public dataSource = new MatTableDataSource<Tag>([]);
  public displayedColumns: string[] = [
    'name',
    'color',
    'description',
    'action',
  ];
  public tags = this.tagService.tagsByWorkspaceId(this.workspaceId);
  constructor() {
    effect(() => {
      this.dataSource.data = this.tags();
      if (this.paginator())
        this.paginator()!.length = this.dataSource.data.length;
    });
  }

  public ngOnInit() {
    this.isLoading.set(true);
    this.tagService
      .getTagsByWorkspaceId(this.workspaceId())
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

  public openDialog(tagId?: Id) {
    this.matDialog.open(TagDialogComponent, {
      data: { workspaceId: this.workspaceId(), tagId: tagId },
      width: '500px',
    });
  }
}
