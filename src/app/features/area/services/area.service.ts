import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Area, AreaRequest } from '../models/area';

@Injectable({
  providedIn: 'root',
})
export class AreaService {
  private readonly http = inject(HttpClient);
  constructor() {}

  public getAreasByLocationId(id: string) {
    return this.http.get<Area[]>(`${environment.apiUrl}/api/area/location`, {
      params: { id },
    });
  }

  public createArea(locationId: string, req: AreaRequest) {
    return this.http.post<Area>(`${environment.apiUrl}/api/area`, {
      locationId,
      name: req.name,
      description: req.description,
    });
  }

  public updateArea(id: string, req: AreaRequest) {
    return this.http.put<Area>(
      `${environment.apiUrl}/api/area`,
      { name: req.name, description: req.description },
      { params: { id: id } }
    );
  }

  public getById(id: string) {
    return this.http.get<Area>(`${environment.apiUrl}/api/area`, {
      params: { id: id },
    });
  }
}
