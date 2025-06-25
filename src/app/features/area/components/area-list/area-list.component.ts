import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { debounceTime } from 'rxjs';
// import { areaDialogComponent } from '../../../area/components/area-dialog/area-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { Id } from '../../../../shared/models/entity';
import { Area } from '../../models/area';
import { AreaService } from '../../services/area.service';
import { AreaDialogComponent } from '../area-dialog/area-dialog.component';

@Component({
  selector: 'app-area-list',
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
  templateUrl: './area-list.component.html',
  styleUrl: './area-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AreaListComponent {
  private readonly matDialog = inject(MatDialog);
  private readonly areaService = inject(AreaService);

  public locationId = input.required<string>();
  private areas = this.areaService.areasByLocationId(this.locationId);
  private paginator = viewChild.required(MatPaginator);
  private sort = viewChild.required(MatSort);
  public search = new FormControl('');
  public dataSource = new MatTableDataSource<Area>([]);
  public displayedColumns: string[] = ['name', 'description', 'action'];
  public isLoading = signal(false);

  constructor() {
    effect(() => {
      this.dataSource.data = this.areas();
      if (this.paginator && this.paginator()) {
        this.paginator().length = this.dataSource.data.length;
      }
    });
  }

  public ngOnInit(): void {
    this.isLoading.set(true);
    this.areaService
      .getAreasByLocationId(this.locationId())
      .subscribe(() => this.isLoading.set(false));
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

  public openDialog(areaId?: Id) {
    this.matDialog.open(AreaDialogComponent, {
      data: { locationId: this.locationId(), areaId: areaId },
      width: '500px',
    });
  }
}
