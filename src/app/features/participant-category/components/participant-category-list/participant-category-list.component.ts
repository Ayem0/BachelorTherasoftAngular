import {
  Component,
  effect,
  inject,
  signal,
  Signal,
  viewChild,
} from '@angular/core';
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
import { Id } from '../../../../shared/models/entity';
import { ParticipantCategory } from '../../models/participant-category';
import { ParticipantCategoryService } from '../../services/participant-category.service';
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
  private readonly participantCategoryService = inject(
    ParticipantCategoryService
  );
  private readonly workspaceId = inject(ROUTER_OUTLET_DATA) as Signal<string>;
  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);

  public search = new FormControl('');
  public isLoading = signal(false);
  public dataSource = new MatTableDataSource<ParticipantCategory>([]);
  public displayedColumns: string[] = [
    'name',
    'color',
    'description',
    'action',
  ];
  public participantCategories =
    this.participantCategoryService.participantCategoriesByWorkspaceId(
      this.workspaceId()
    );

  constructor() {
    effect(() => {
      this.dataSource.data = this.participantCategories();
      if (this.paginator()) {
        this.paginator()!.length = this.dataSource.data.length;
      }
    });
  }

  public ngOnInit(): void {
    this.isLoading.set(true);
    this.participantCategoryService
      .getParticipantCategoriesByWorkspaceId(this.workspaceId())
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

  public openDialog(participantCategoryId?: Id): void {
    this.matDialog.open(ParticipantCategoryDialogComponent, {
      data: {
        workspaceId: this.workspaceId(),
        participantCategoryId: participantCategoryId,
      },
      width: '500px',
    });
  }
}
