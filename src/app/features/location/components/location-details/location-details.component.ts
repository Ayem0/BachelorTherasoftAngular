import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AreaListComponent } from '../../../area/components/area-list/area-list.component';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-location-details',
  imports: [AreaListComponent],
  templateUrl: './location-details.component.html',
  styleUrl: './location-details.component.scss',
})
export class LocationDetailsComponent implements OnInit {
  private readonly locationService = inject(LocationService);
  private readonly route = inject(ActivatedRoute);

  public isLoading = signal(false);
  public locationId = this.route.snapshot.paramMap.get('id');
  public location = this.locationService.locationById(this.locationId);

  public ngOnInit(): void {
    if (this.locationId) {
      this.isLoading.set(true);
      this.locationService
        .getById(this.locationId)
        .subscribe(() => this.isLoading.set(false));
    } else {
      // TODO faire un redirect ou un truc du genre jsp
    }
  }
}
