import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Room, RoomRequest } from './room';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private readonly http = inject(HttpClient);
  constructor() {}

  public getRoomsByAreaId(areaId: string) {
    return this.http.get<Room[]>(`${environment.apiUrl}/api/room/area`, {
      params: { areaId },
    });
  }

  public getRoomsByWorkspaceId(workspaceId: string) {
    return this.http.get<Room[]>(`${environment.apiUrl}/api/room/workspace`, {
      params: { id: workspaceId },
    });
  }

  public getById(id: string) {
    return this.http.get<Room>(`${environment.apiUrl}/api/room`, {
      params: { id },
    });
  }

  public createRoom(areaId: string, req: RoomRequest) {
    return this.http.post<Room>(`${environment.apiUrl}/api/room`, {
      areaId,
      name: req.name,
      description: req.description,
    });
  }

  public updateRoom(id: string, req: RoomRequest) {
    return this.http.put<Room>(
      `${environment.apiUrl}/api/room`,
      { name: req.name, description: req.description },
      { params: { id: id } }
    );
  }
}
