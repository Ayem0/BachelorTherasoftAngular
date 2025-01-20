import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { Place } from '../../location';
import { LocationStore } from '../../location.store';

@Component({
  selector: 'app-location-details',
  imports: [
    MatIcon,
    MatButton
  ],
  templateUrl: './location-details.component.html',
  styleUrl: './location-details.component.scss'
})
export class LocationDetailsComponent implements OnInit{
  private readonly locationStore = inject(LocationStore);
  private readonly route = inject(ActivatedRoute);

  public loading = this.locationStore.loading;
  public location = signal<Place | null>(null);
  public locationId = this.route.snapshot.paramMap.get('id');

  public ngOnInit(): void {
    if (this.locationId) {
      this.locationStore.getLocationById(this.locationId).subscribe(x => this.location.set(x));
    } else {
      // TODO faire un redirect ou un truc du genre jsp
    }
  }

}
