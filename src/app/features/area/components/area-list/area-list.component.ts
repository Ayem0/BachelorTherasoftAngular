import { Component, inject, input, viewChild } from '@angular/core';
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
import { Area } from '../../models/area';
import { AreaStore } from '../../services/area.store';
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
})
export class AreaListComponent {
  private readonly matDialog = inject(MatDialog);
  private readonly areaStore = inject(AreaStore);
  public readonly locationId = input.required<string>();

  public search = new FormControl('');
  private paginator = viewChild.required(MatPaginator);
  private sort = viewChild.required(MatSort);

  public dataSource = new MatTableDataSource<Area>([]);
  public displayedColumns: string[] = ['name', 'description', 'action'];
  public loading = this.areaStore.loading;

  public ngOnInit(): void {
    this.areaStore
      .getAreasByLocationId(this.locationId())
      .subscribe((areas) => {
        this.dataSource.data = areas ?? [];
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

  public openDialog(area?: Partial<Area>) {
    this.matDialog
      .open(AreaDialogComponent, {
        data: { locationId: this.locationId, area: area },
        width: '500px',
      })
      .afterClosed()
      .subscribe((x) => {
        if (x) {
          this.dataSource.data =
            this.areaStore
              .areaIdsByLocationId()
              .get(this.locationId())
              ?.map((x) => this.areaStore.areas().get(x)!) ?? [];
        }
      });
  }
}
