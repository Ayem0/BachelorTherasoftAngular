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

  public getAreasByLocationId(id: string) {
    return this.http.get<Area[]>(`${environment.apiUrl}/api/area/location`, { params: { id}});
  }

  public createArea(locationId: string, name: string, description?: string) {    
    return this.http.post<Area>(`${environment.apiUrl}/api/area`, { locationId, name, description })
  }

  public updateArea(id: string, newName?: string, newDescription?: string) {
    return this.http.put<Area>(`${environment.apiUrl}/api/area`, { newName, newDescription }, { params: { id: id } })
  }

  public getById(id: string) {
    return this.http.get<Area>(`${environment.apiUrl}/api/area`, { params: { id: id } });
  }
}
