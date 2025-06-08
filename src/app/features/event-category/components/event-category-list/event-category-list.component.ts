import {
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
import { EventCategory } from '../../models/event-category';
import { EventCategoryService } from '../../services/event-category.service';
import { EventCategoryDialogComponent } from '../event-category-dialog/event-category-dialog.component';

@Component({
  selector: 'app-event-category-list',
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
  templateUrl: './event-category-list.component.html',
  styleUrl: './event-category-list.component.scss',
})
export class EventCategoryListComponent {
  private readonly matDialog = inject(MatDialog);
  private readonly eventCategoryService = inject(EventCategoryService);
  private readonly workspaceId = inject(ROUTER_OUTLET_DATA) as Signal<string>;
  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);

  public search = new FormControl('');
  public isLoading = signal(false);
  public dataSource = new MatTableDataSource<EventCategory>([]);
  public displayedColumns: string[] = [
    'name',
    'color',
    'description',
    'action',
  ];
  private eventCategories =
    this.eventCategoryService.eventCategoriesByWorkspaceId(this.workspaceId);

  constructor() {
    effect(() => {
      this.dataSource.data = this.eventCategories();
      if (this.paginator()) {
        this.paginator()!.length = this.dataSource.data.length;
      }
    });
  }

  public ngOnInit(): void {
    this.isLoading.set(true);
    this.eventCategoryService
      .getEventCategoriesByWorkspaceId(this.workspaceId())
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

  public openDialog(eventCategoryId?: Id): void {
    this.matDialog.open(EventCategoryDialogComponent, {
      data: {
        workspaceId: this.workspaceId(),
        eventCategoryId: eventCategoryId,
      },
      width: '500px',
    });
  }
}
