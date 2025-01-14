import { Component, inject, input, Signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { debounceTime } from 'rxjs';
// import { locationDialogComponent } from '../../../location/components/location-dialog/location-dialog.component';
import { locationStore } from '../../../location/location.store';
import { Place } from '../../location';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ROUTER_OUTLET_DATA, RouterLink } from '@angular/router';
import { LocationDialogComponent } from '../location-dialog/location-dialog.component';

@Component({
  selector: 'app-location-list',
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
  templateUrl: './location-list.component.html',
  styleUrl: './location-list.component.scss'
})
export class LocationListComponent {
  private readonly matDialog = inject(MatDialog);
  public readonly locationStore = inject(locationStore);
  private readonly workspaceId = inject(ROUTER_OUTLET_DATA) as Signal<string>;

  public search = new FormControl("");
  private paginator = viewChild.required(MatPaginator);
  private sort = viewChild.required(MatSort);

  public dataSource = new MatTableDataSource<Place>([]);
  public displayedColumns: string[] = ['name', 'description', 'address', 'city', 'country', 'action'];

  public ngOnInit(): void {
    this.locationStore.getLocationsByWorkspaceId(this.workspaceId()).subscribe(locations => {
      this.dataSource.data = locations ?? [];
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

  public openDialog(location?: Partial<Place>) {
    this.matDialog.open(LocationDialogComponent, { data: { workspaceId: this.workspaceId(), location: location}, width: '500px' }).afterClosed().subscribe(x => {
      if (x) {
        this.dataSource.data = this.locationStore.locations().get(this.workspaceId()) ?? [];
      } 
    });
  }
}
