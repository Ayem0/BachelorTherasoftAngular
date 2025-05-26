import {
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
// import { roomDialogComponent } from '../../../room/components/room-dialog/room-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { Id } from '../../../../shared/models/entity';
import { Room } from '../../models/room';
import { RoomService } from '../../services/room.service';
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
    ReactiveFormsModule,
  ],
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.scss',
})
export class RoomListComponent {
  private readonly matDialog = inject(MatDialog);
  private readonly roomService = inject(RoomService);
  private paginator = viewChild(MatPaginator);
  private sort = viewChild(MatSort);
  readonly areaId = input.required<string>();

  public search = new FormControl('');
  public dataSource = new MatTableDataSource<Room>([]);
  public displayedColumns: string[] = ['name', 'description', 'action'];
  public isLoading = signal(false);
  private rooms = this.roomService.roomByAreaId(this.areaId);

  constructor() {
    effect(() => {
      this.dataSource.data = this.rooms();
      if (this.paginator && this.paginator()) {
        this.paginator()!.length = this.dataSource.data.length;
      }
    });
  }

  public ngOnInit(): void {
    this.isLoading.set(true);
    this.roomService
      .getRoomsByAreaId(this.areaId())
      .subscribe(() => this.isLoading.set(false));
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator() ?? null;
    this.dataSource.sort = this.sort() ?? null;
    if (this.paginator())
      this.paginator()!.length = this.dataSource.data.length;
    this.search.valueChanges
      .pipe(debounceTime(200))
      .subscribe((searchValue) => {
        this.dataSource.filter = searchValue?.trim().toLowerCase() || '';
        this.dataSource.paginator?.firstPage();
        if (this.paginator())
          this.paginator()!.length = this.dataSource.data.length;
      });
  }

  public openDialog(roomId?: Id): void {
    this.matDialog.open(RoomDialogComponent, {
      data: { areaId: this.areaId(), roomId: roomId },
      width: '500px',
    });
  }
}
