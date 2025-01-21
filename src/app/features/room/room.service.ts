import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Room } from './room';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private readonly http = inject(HttpClient);
  constructor() { }

  public getRoomsByAreaId(areaId: string) {
    return this.http.get<Room[]>(`${environment.apiUrl}/api/room/area`, { params: { areaId }});
  }

  public getById(id: string) {
    return this.http.get<Room>(`${environment.apiUrl}/api/room`, { params: { id }});
  }

  public createRoom(areaId: string, name: string, description?: string, address?: string, city?: string, country?: string) {    
    return this.http.post<Room>(`${environment.apiUrl}/api/room`, { areaId, name, description, address, city, country })
  }

  public updateRoom(id: string, newName?: string, newDescription?: string) {
    return this.http.put<Room>(`${environment.apiUrl}/api/room`, { newName, newDescription }, { params: { id: id } })
  }
}
