import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Place } from './location';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly http = inject(HttpClient);
  constructor() { }

  public getLocationByWorkspaceId(workspaceId: string) {
    return this.http.get<Place[]>(`${environment.apiUrl}/api/location/workspace?workspaceId=${workspaceId}`);
  }

  public createLocation(workspaceId: string, name: string, description?: string, address?: string, city?: string, country?: string) {
    console.log(workspaceId, name, description, address, city, country);
    
    return this.http.post<Place>(`${environment.apiUrl}/api/location`, { workspaceId, name, description, address, city, country })
  }

  public updateLocation(id: string, newName?: string, newDescription?: string) {
    return this.http.put<Place>(`${environment.apiUrl}/api/location`, { newName, newDescription }, { params: { id: id } })
  }

  public getLocationDetailsById(id: string) {
    return this.http.get<Place>(`${environment.apiUrl}/api/location/details`, { params: { id: id } });
  }
}
