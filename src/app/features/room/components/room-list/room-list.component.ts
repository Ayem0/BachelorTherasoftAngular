import { Component, inject, input, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { debounceTime } from 'rxjs';
// import { roomDialogComponent } from '../../../room/components/room-dialog/room-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { RoomStore } from '../../../room/room.store';
import { Room } from '../../room';
import { RoomDialogComponent } from '../room-dialog/room-dialog.component';

@Component({
  selector: 'app-room-list',
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
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.scss'
})
export class RoomListComponent {
  private readonly matDialog = inject(MatDialog);
  private readonly roomStore = inject(RoomStore);
  readonly areaId = input.required<string>();

  public search = new FormControl("");
  private paginator = viewChild.required(MatPaginator);
  private sort = viewChild.required(MatSort);

  public dataSource = new MatTableDataSource<Room>([]);
  public displayedColumns: string[] = ['name', 'description', 'action'];
  public loading = this.roomStore.loading;

  public ngOnInit(): void {
    this.roomStore.getRoomsByAreaId(this.areaId()).subscribe(rooms => {
      this.dataSource.data = rooms ?? [];
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

  public openDialog(room?: Partial<Room>) {
    this.matDialog.open(RoomDialogComponent, { data: { areaId: this.areaId, room: room}, width: '500px' }).afterClosed().subscribe(x => {
      if (x) {
        this.dataSource.data = this.roomStore.roomIdsByAreaId().get(this.areaId())?.map(x => this.roomStore.rooms().get(x)!) ?? [];
      } 
    });
  }
}
