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
// import { participantDialogComponent } from '../../../participant/components/participant-dialog/participant-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ROUTER_OUTLET_DATA, RouterLink } from '@angular/router';
import { Id } from '../../../../shared/models/entity';
import { Participant } from '../../models/participant';
import { ParticipantService } from '../../services/participant.service';
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
    ReactiveFormsModule,
  ],
  templateUrl: './participant-list.component.html',
  styleUrl: './participant-list.component.scss',
})
export class ParticipantListComponent {
  private readonly matDialog = inject(MatDialog);
  private readonly participantService = inject(ParticipantService);
  private readonly workspaceId = inject(ROUTER_OUTLET_DATA) as Signal<string>;
  private readonly paginator = viewChild(MatPaginator);
  private readonly sort = viewChild(MatSort);

  public isLoading = signal(false);
  public search = new FormControl('');
  public participants = this.participantService.participantsByWorkspaceId(
    this.workspaceId()
  );
  public dataSource = new MatTableDataSource<Participant>([]);
  public displayedColumns: string[] = [
    'firstName',
    'lastName',
    'email',
    'phoneNumber',
    'description',
    'address',
    'city',
    'country',
    'dateOfBirth',
    'action',
  ];

  constructor() {
    effect(() => {
      this.dataSource.data = this.participants();
      if (this.paginator()) {
        this.paginator()!.length = this.dataSource.data.length;
      }
    });
  }

  public ngOnInit(): void {
    this.isLoading.set(true);
    this.participantService
      .getByWorkspaceId(this.workspaceId())
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

  public openDialog(participantId?: Id): void {
    this.matDialog.open(ParticipantDialogComponent, {
      data: { workspaceId: this.workspaceId(), participant: participantId },
      width: '500px',
    });
  }
}
