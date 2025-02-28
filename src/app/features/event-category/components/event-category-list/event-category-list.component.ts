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
import { EventCategory } from '../../event-category';
import { EventCategoryStore } from '../../event-category.store';
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
    ReactiveFormsModule
  ],
  templateUrl: './event-category-list.component.html',
  styleUrl: './event-category-list.component.scss'
})
export class EventCategoryListComponent {
  private readonly matDialog = inject(MatDialog);
  public readonly eventCategoryStore = inject(EventCategoryStore);
  private readonly workspaceId = inject(ROUTER_OUTLET_DATA) as Signal<string>;
  

  public search = new FormControl("");
  private paginator = viewChild.required(MatPaginator);
  private sort = viewChild.required(MatSort);

  public dataSource = new MatTableDataSource<EventCategory>([]);
  public displayedColumns: string[] = ['name', 'color', 'icon', 'description', 'action'];

  public ngOnInit(): void {
    this.eventCategoryStore.getEventCategoriesByWorkspaceId(this.workspaceId()).subscribe(eventCategories => {
      this.dataSource.data = eventCategories ?? [];
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

  public openDialog(eventCategory?: Partial<EventCategory>) {
    this.matDialog.open(EventCategoryDialogComponent, { data: { workspaceId: this.workspaceId, eventCategory: eventCategory}, width: '500px' }).afterClosed().subscribe(x => {
      if (x) {
        this.dataSource.data = this.eventCategoryStore.eventCategoryIdsByWorkspaceId().get(this.workspaceId())?.map(x => this.eventCategoryStore.eventCategories().get(x)!) ?? [];
      } 
    });
  }
}
