import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { Place } from '../../location';
import { LocationStore } from '../../location.store';

@Component({
  selector: 'app-location-details',
  imports: [
    MatIcon
  ],
  templateUrl: './location-details.component.html',
  styleUrl: './location-details.component.scss'
})
export class LocationDetailsComponent implements OnInit{
  private readonly locationStore = inject(LocationStore);
  private readonly route = inject(ActivatedRoute);

  public loading = this.locationStore.loading;
  public locationDetails = signal<Place | null>(null);
  public workspaceId = this.route.snapshot.paramMap.get('workspaceId');
  public locationId = this.route.snapshot.paramMap.get('locationId');

  public ngOnInit(): void {
    console.log("JZEOJZOEZEZEJZKNA")
    if (this.workspaceId && this.locationId) {
      this.locationStore.getLocationDetailsById(this.workspaceId, this.locationId).subscribe(x => this.locationDetails.set(x));
    } else {
      // TODO faire un redirect ou un truc du genre jsp
    }
  }

}
