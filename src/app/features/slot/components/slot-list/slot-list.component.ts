import { Component, inject, Signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { debounceTime } from 'rxjs';
// import { slotDialogComponent } from '../../../slot/components/slot-dialog/slot-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ROUTER_OUTLET_DATA, RouterLink } from '@angular/router';
import { SlotStore } from '../../../slot/slot.store';
import { Slot } from '../../slot';
import { SlotDialogComponent } from '../slot-dialog/slot-dialog.component';

@Component({
  selector: 'app-slot-list',
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
  templateUrl: './slot-list.component.html',
  styleUrl: './slot-list.component.scss'
})
export class SlotListComponent {
  private readonly matDialog = inject(MatDialog);
  public readonly slotStore = inject(SlotStore);
  private readonly workspaceId = inject(ROUTER_OUTLET_DATA) as Signal<string>;

  public search = new FormControl("");
  private paginator = viewChild.required(MatPaginator);
  private sort = viewChild.required(MatSort);

  public dataSource = new MatTableDataSource<Slot>([]);
  public displayedColumns: string[] = ['firstName', 'lastName', 'email', 'phoneNumber', 'description', 'address', 'city', 'country', 'dateOfBirth', 'action'];

  public ngOnInit(): void {
    this.slotStore.getSlotsByWorkspaceId(this.workspaceId()).subscribe(slots => {
      this.dataSource.data = slots;
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

  public openDialog(slot?: Partial<Slot>) {
    this.matDialog.open(SlotDialogComponent, { data: { workspaceId: this.workspaceId(), slot: slot}, width: '500px' }).afterClosed().subscribe(x => {
      if (x) {
        this.dataSource.data = this.slotStore.slots().get(this.workspaceId()) ?? [];
      } 
    });
  }
}
