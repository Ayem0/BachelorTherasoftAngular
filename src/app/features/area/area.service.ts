import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Area } from './area';

@Injectable({
  providedIn: 'root'
})
export class AreaService {
  private readonly http = inject(HttpClient);
  constructor() { }

  public getAreasByLocationId(workspaceId: string, locationId: string) {
    return this.http.get<Area[]>(`${environment.apiUrl}/api/areas/location?workspaceId=${workspaceId}locationId=${locationId}`);
  }

  public createArea(locationId: string, name: string, description?: string) {    
    return this.http.post<Area>(`${environment.apiUrl}/api/areas`, { locationId, name, description })
  }

  public updateArea(id: string, newName?: string, newDescription?: string) {
    return this.http.put<Area>(`${environment.apiUrl}/api/areas`, { newName, newDescription }, { params: { id: id } })
  }

  public getAreaDetailsById(id: string) {
    return this.http.get<Area>(`${environment.apiUrl}/api/areas/details`, { params: { id: id } });
  }
}
