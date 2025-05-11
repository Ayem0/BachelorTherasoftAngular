import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomListComponent } from '../../../room/components/room-list/room-list.component';
import { AreaService } from '../../services/area.service';

@Component({
  selector: 'app-area-details',
  imports: [RoomListComponent],
  templateUrl: './area-details.component.html',
  styleUrl: './area-details.component.scss',
})
export class AreaDetailsComponent {
  private readonly areaService = inject(AreaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  public isLoading = signal(false);
  public areaId = this.route.snapshot.paramMap.get('id');
  public area = this.areaService.areaById(this.areaId);

  public async ngOnInit(): Promise<void> {
    if (this.areaId) {
      await this.areaService.getById(this.areaId);
    } else {
      this.router.navigate(['/']);
    }
  }
}
