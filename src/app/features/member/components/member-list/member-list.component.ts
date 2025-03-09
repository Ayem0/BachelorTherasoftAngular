import {
  AfterViewInit,
  Component,
  effect,
  inject,
  OnInit,
  Signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
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
    ReactiveFormsModule,
  ],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.scss',
})
export class MemberListComponent implements OnInit, AfterViewInit {
  private readonly memberStore = inject(MemberStore);
  private readonly workspaceId = inject(ROUTER_OUTLET_DATA) as Signal<string>;
  private readonly paginator = viewChild.required(MatPaginator);
  private readonly sort = viewChild.required(MatSort);

  public search = new FormControl('');
  public isLoading = this.memberStore.isLoading;
  public dataSource = new MatTableDataSource<Member>([]);
  public displayedColumns: string[] = ['firstName', 'lastName', 'action'];

  constructor() {
    effect(() => {
      this.dataSource.data = this.memberStore.membersBySelectedWorkspaceId();
      if (this.paginator && this.paginator()) {
        this.paginator().length = this.dataSource.data.length;
      }
    });
  }

  public ngOnInit(): void {
    this.memberStore.setSelectedWorkspaceId(this.workspaceId());
    this.memberStore.getMembersByWorkspaceId();
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator();
    this.dataSource.sort = this.sort();
    this.search.valueChanges.pipe(debounceTime(200)).subscribe((x) => {
      this.dataSource.filter = x?.trim().toLowerCase() || '';
      this.dataSource.filterPredicate = (data: Member, filter: string) => {
        const dataStr = `${data.firstName} ${data.lastName}`.toLowerCase();
        return dataStr.includes(filter);
      };
      this.dataSource.paginator?.firstPage();
      this.paginator().length = this.dataSource.filteredData.length;
    });
  }
}
