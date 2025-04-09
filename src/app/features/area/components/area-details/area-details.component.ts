import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoomListComponent } from '../../../room/components/room-list/room-list.component';
import { Area } from '../../models/area';
import { AreaStore } from '../../services/area.store';

@Component({
  selector: 'app-area-details',
  imports: [RoomListComponent],
  templateUrl: './area-details.component.html',
  styleUrl: './area-details.component.scss',
})
export class AreaDetailsComponent {
  private readonly areaStore = inject(AreaStore);
  private readonly route = inject(ActivatedRoute);

  public loading = this.areaStore.loading;
  public area = signal<Area | null>(null);
  public areaId = signal(this.route.snapshot.paramMap.get('id'));

  public ngOnInit(): void {
    if (this.areaId()) {
      this.areaStore
        .getAreaById(this.areaId()!)
        .subscribe((x) => this.area.set(x));
    } else {
      // TODO faire un redirect ou un truc du genre jsp
    }
  }
}
