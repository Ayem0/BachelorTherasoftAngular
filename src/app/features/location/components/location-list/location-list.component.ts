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
// import { locationDialogComponent } from '../../../location/components/location-dialog/location-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ROUTER_OUTLET_DATA, RouterLink } from '@angular/router';
import { Id } from '../../../../shared/models/entity';
import { Location } from '../../models/location';
import { LocationService } from '../../services/location.service';
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
    ReactiveFormsModule,
  ],
  templateUrl: './location-list.component.html',
  styleUrl: './location-list.component.scss',
})
export class LocationListComponent {
  private readonly matDialog = inject(MatDialog);
  private readonly locationService = inject(LocationService);
  private readonly workspaceId = inject(ROUTER_OUTLET_DATA) as Signal<string>;

  public search = new FormControl('');
  private paginator = viewChild.required(MatPaginator);
  private sort = viewChild.required(MatSort);

  public dataSource = new MatTableDataSource<Location>([]);
  public displayedColumns: string[] = [
    'name',
    'description',
    'address',
    'city',
    'country',
    'action',
  ];
  public isLoading = signal(false);
  private locations = this.locationService.locationsByWorkspaceId(
    this.workspaceId()
  );

  constructor() {
    effect(() => {
      this.dataSource.data = this.locations();
      if (this.paginator()) {
        this.paginator().length = this.dataSource.data.length;
      }
    });
  }

  public async ngOnInit(): Promise<void> {
    this.isLoading.set(true);
    await this.locationService.getLocationsByWorkspaceId(this.workspaceId());
    this.isLoading.set(false);
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

  public openDialog(locationId?: Id): void {
    this.matDialog.open(LocationDialogComponent, {
      data: { workspaceId: this.workspaceId(), locationId: locationId },
      width: '500px',
    });
  }
}
