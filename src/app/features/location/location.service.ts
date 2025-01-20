import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Place } from './location';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly http = inject(HttpClient);
  constructor() { }

  public getLocationsByWorkspaceId(workspaceId: string) {
    return this.http.get<Place[]>(`${environment.apiUrl}/api/location/workspace`, { params: { workspaceId }});
  }

  public getById(id: string) {
    return this.http.get<Place>(`${environment.apiUrl}/api/location`, { params: { id }});
  }

  public createLocation(workspaceId: string, name: string, description?: string, address?: string, city?: string, country?: string) {    
    return this.http.post<Place>(`${environment.apiUrl}/api/location`, { workspaceId, name, description, address, city, country })
  }

  public updateLocation(id: string, newName?: string, newDescription?: string) {
    return this.http.put<Place>(`${environment.apiUrl}/api/location`, { newName, newDescription }, { params: { id: id } })
  }

  public getLocationDetailsById(workspaceId: string, locationId: string) {
    return this.http.get<Place>(`${environment.apiUrl}/api/location/details`, { params: { workspaceId, locationId } });
  }
}
