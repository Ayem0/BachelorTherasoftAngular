import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LocationRequest, Place } from './location';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private readonly http = inject(HttpClient);
  constructor() {}

  public getLocationsByWorkspaceId(workspaceId: string) {
    return this.http.get<Place[]>(
      `${environment.apiUrl}/api/location/workspace`,
      { params: { workspaceId } }
    );
  }

  public getById(id: string) {
    return this.http.get<Place>(`${environment.apiUrl}/api/location`, {
      params: { id },
    });
  }

  public createLocation(workspaceId: string, req: LocationRequest) {
    return this.http.post<Place>(`${environment.apiUrl}/api/location`, {
      workspaceId,
      name: req.name,
      description: req.description,
      address: req.address,
      city: req.city,
      country: req.country,
    });
  }

  public updateLocation(id: string, req: LocationRequest) {
    return this.http.put<Place>(
      `${environment.apiUrl}/api/location`,
      {
        name: req.name,
        description: req.description,
        address: req.address,
        city: req.city,
        country: req.country,
      },
      { params: { id: id } }
    );
  }

  public getLocationDetailsById(id: string) {
    return this.http.get<Place>(`${environment.apiUrl}/api/location/details`, {
      params: { id: id },
    });
  }
}
