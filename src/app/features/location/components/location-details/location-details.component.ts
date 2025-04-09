import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AreaListComponent } from '../../../area/components/area-list/area-list.component';
import { Location } from '../../models/location';
import { LocationStore } from '../../services/location.store';

@Component({
  selector: 'app-location-details',
  imports: [AreaListComponent],
  templateUrl: './location-details.component.html',
  styleUrl: './location-details.component.scss',
})
export class LocationDetailsComponent implements OnInit {
  private readonly locationStore = inject(LocationStore);
  private readonly route = inject(ActivatedRoute);

  public loading = this.locationStore.loading;
  public location = signal<Location | null>(null);
  public locationId = signal(this.route.snapshot.paramMap.get('id'));

  public ngOnInit(): void {
    if (this.locationId()) {
      this.locationStore
        .getLocationById(this.locationId()!)
        .subscribe((x) => this.location.set(x));
    } else {
      // TODO faire un redirect ou un truc du genre jsp
    }
  }
}
