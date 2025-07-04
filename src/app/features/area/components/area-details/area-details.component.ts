import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomListComponent } from '../../../room/components/room-list/room-list.component';
import { AreaService } from '../../services/area.service';

@Component({
  selector: 'app-area-details',
  imports: [RoomListComponent],
  templateUrl: './area-details.component.html',
  styleUrl: './area-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AreaDetailsComponent {
  private readonly areaService = inject(AreaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  public isLoading = signal(false);
  public areaId = this.route.snapshot.paramMap.get('id');
  public area = this.areaService.areaById(this.areaId);

  public ngOnInit(): void {
    this.isLoading.set(true);
    if (this.areaId) {
      this.areaService
        .getById(this.areaId)
        .subscribe(() => this.isLoading.set(false));
    } else {
      this.router.navigate(['/']);
    }
  }
}
