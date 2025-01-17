import { Component, inject, Signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ROUTER_OUTLET_DATA, RouterLink } from '@angular/router';
import { debounceTime } from 'rxjs';
import { Member } from '../../member';
import { MemberStore } from '../../member.store';
import { MemberDialogComponent } from '../member-dialog/member-dialog.component';

@Component({
  selector: 'app-member-list',
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
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.scss'
})
export class MemberListComponent {
  private readonly matDialog = inject(MatDialog);
  private readonly memberStore = inject(MemberStore);
  private readonly workspaceId = inject(ROUTER_OUTLET_DATA) as Signal<string>;
  

  public search = new FormControl("");
  private paginator = viewChild.required(MatPaginator);
  private sort = viewChild.required(MatSort);
  public error = this.memberStore.error;
  public loading = this.memberStore.loading;

  public dataSource = new MatTableDataSource<Member>([]);
  public displayedColumns: string[] = ['firstName', 'lastName', 'action'];

  public ngOnInit(): void {
    this.memberStore.getMembersByWorkspaceId(this.workspaceId()).subscribe(Members => {
      console.log(Members);
      this.dataSource.data = Members ?? [];
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

  public openDialog(Member?: Partial<Member>) {
    this.matDialog.open(MemberDialogComponent, { data: { workspaceId: this.workspaceId, Member: Member}, width: '500px' }).afterClosed().subscribe(x => {
      if (x) {
        this.dataSource.data = this.memberStore.members().get(this.workspaceId()) ?? [];
      } 
    });
  }
}
