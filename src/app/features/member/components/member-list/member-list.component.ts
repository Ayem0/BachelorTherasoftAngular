import {
  AfterViewInit,
  Component,
  effect,
  inject,
  OnInit,
  signal,
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
import { User } from '../../../../core/auth/models/auth';
import { MemberService } from '../../services/member.service';

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
  private readonly memberService = inject(MemberService);
  private readonly workspaceId = inject(ROUTER_OUTLET_DATA) as Signal<string>;
  private readonly paginator = viewChild.required(MatPaginator);
  private readonly sort = viewChild.required(MatSort);

  public search = new FormControl('');
  public isLoading = signal(false);
  public dataSource = new MatTableDataSource<User>([]);
  public displayedColumns: string[] = ['firstName', 'lastName', 'action'];
  public members = this.memberService.membersByWorkspaceId(this.workspaceId());

  constructor() {
    effect(() => {
      this.dataSource.data = this.members();
      if (this.paginator && this.paginator()) {
        this.paginator().length = this.dataSource.data.length;
      }
    });
  }

  public async ngOnInit(): Promise<void> {
    this.isLoading.set(true);
    await this.memberService.getMembersByWorkspaceId(this.workspaceId());
    this.isLoading.set(false);
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator();
    this.dataSource.sort = this.sort();
    this.search.valueChanges.pipe(debounceTime(200)).subscribe((x) => {
      this.dataSource.filter = x?.trim().toLowerCase() || '';
      this.dataSource.filterPredicate = (data: User, filter: string) => {
        const dataStr = `${data.firstName} ${data.lastName}`.toLowerCase();
        return dataStr.includes(filter);
      };
      this.dataSource.paginator?.firstPage();
      this.paginator().length = this.dataSource.filteredData.length;
    });
  }
}
