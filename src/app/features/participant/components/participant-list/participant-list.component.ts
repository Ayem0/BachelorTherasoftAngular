import { Component, inject, input, Signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { debounceTime } from 'rxjs';
// import { participantDialogComponent } from '../../../participant/components/participant-dialog/participant-dialog.component';
import { ParticipantStore } from '../../../participant/participant.store';
import { Participant } from '../../participant';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ROUTER_OUTLET_DATA, RouterLink } from '@angular/router';
import { ParticipantDialogComponent } from '../participant-dialog/participant-dialog.component';

@Component({
  selector: 'app-participant-list',
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
  templateUrl: './participant-list.component.html',
  styleUrl: './participant-list.component.scss'
})
export class ParticipantListComponent {
  private readonly matDialog = inject(MatDialog);
  public readonly participantStore = inject(ParticipantStore);
  private readonly workspaceId = inject(ROUTER_OUTLET_DATA) as Signal<string>;

  public search = new FormControl("");
  private paginator = viewChild.required(MatPaginator);
  private sort = viewChild.required(MatSort);

  public dataSource = new MatTableDataSource<Participant>([]);
  public displayedColumns: string[] = ['firstName', 'lastName', 'email', 'phoneNumber', 'description', 'address', 'city', 'country', 'dateOfBirth', 'action'];

  public ngOnInit(): void {
    this.participantStore.getParticipantsByWorkspaceId(this.workspaceId()).subscribe(participants => {
      this.dataSource.data = participants;
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

  public openDialog(participant?: Partial<Participant>) {
    this.matDialog.open(ParticipantDialogComponent, { data: { workspaceId: this.workspaceId(), participant: participant}, width: '500px' }).afterClosed().subscribe(x => {
      if (x) {
        this.dataSource.data = this.participantStore.participants().get(this.workspaceId()) ?? [];
      } 
    });
  }
}
