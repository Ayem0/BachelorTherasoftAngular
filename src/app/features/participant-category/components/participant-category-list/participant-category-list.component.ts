import { Component, inject, Signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { debounceTime } from 'rxjs';
// import { participant-categoryDialogComponent } from '../../../participant-category/components/participant-category-dialog/participant-category-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ROUTER_OUTLET_DATA, RouterLink } from '@angular/router';
import { ParticipantCategory } from '../../models/participant-category';
import { ParticipantCategoryStore } from '../../services/participant-category.store';
import { ParticipantCategoryDialogComponent } from '../participant-category-dialog/participant-category-dialog.component';

@Component({
  selector: 'app-participant-category-list',
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
  templateUrl: './participant-category-list.component.html',
  styleUrl: './participant-category-list.component.scss',
})
export class ParticipantCategoryListComponent {
  private readonly matDialog = inject(MatDialog);
  public readonly participantCategoryStore = inject(ParticipantCategoryStore);
  private readonly workspaceId = inject(ROUTER_OUTLET_DATA) as Signal<string>;

  public search = new FormControl('');
  private paginator = viewChild.required(MatPaginator);
  private sort = viewChild.required(MatSort);

  public dataSource = new MatTableDataSource<ParticipantCategory>([]);
  public displayedColumns: string[] = [
    'name',
    'color',
    'icon',
    'description',
    'action',
  ];

  public ngOnInit(): void {
    this.participantCategoryStore
      .getParticipantCategoriesByWorkspaceId(this.workspaceId())
      .subscribe((participantCategories) => {
        this.dataSource.data = participantCategories ?? [];
      });
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator();
    this.dataSource.sort = this.sort();
    this.paginator().length = this.dataSource.data.length;
    this.search.valueChanges.pipe(debounceTime(200)).subscribe((x) => {
      this.dataSource.filter = x?.trim().toLowerCase() || '';
      this.dataSource.paginator?.firstPage();
      this.paginator().length = this.dataSource.data.length;
    });
  }

  public openDialog(participantCategory?: Partial<ParticipantCategory>) {
    this.matDialog
      .open(ParticipantCategoryDialogComponent, {
        data: {
          workspaceId: this.workspaceId(),
          participantCategory: participantCategory,
        },
        width: '500px',
      })
      .afterClosed()
      .subscribe((x) => {
        if (x) {
          const ids = this.participantCategoryStore
            .participantCategoryIdsByWorkspaceId()
            .get(this.workspaceId())!;
          const data = ids?.map(
            (x) => this.participantCategoryStore.participantCategories().get(x)!
          );
          console.log(ids);
          console.log(data);
          this.dataSource.data = data;
        }
      });
  }
}
