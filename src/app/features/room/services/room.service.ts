import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Room, RoomRequest } from '../models/room';
import { RoomStore2 } from './room.store2';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private readonly http = inject(HttpClient);
  private readonly roomStore = inject(RoomStore2);
  public selectedAreaId = signal<string | null>(null);
  public selectedWorkspaceId = signal<string | null>(null);
  public selectedRoomId = signal<string | null>(null);
  public roomsBySelectedAreaId = computed(() =>
    this.roomStore
      .roomsArr()
      .filter((room) => room.areaId === this.selectedAreaId())
  );
  public roomsBySelectedWorkspaceId = computed(() =>
    this.roomStore
      .roomsArr()
      .filter((room) => room.workspaceId === this.selectedWorkspaceId())
  );
  public roomBySelectedRoomId = computed(() =>
    this.selectedRoomId()
      ? this.roomStore.rooms().get(this.selectedRoomId()!) ?? null
      : null
  );

  public async getRoomsByAreaId(areaId: string) {
    await firstValueFrom(
      this.http
        .get<Room[]>(`${environment.apiUrl}/api/room/area`, {
          params: { areaId },
        })
        .pipe(
          tap({
            next: (rooms) => {
              this.roomStore.setRooms(
                rooms.map((room) => ({
                  ...room,
                  areaId: areaId,
                  workspaceId: '',
                }))
              ); // TODO get workspace id
            },
            error: (error) => {
              console.error(error);
            },
          })
        )
    );
  }

  public async getRoomsByWorkspaceId(workspaceId: string) {
    await firstValueFrom(
      this.http
        .get<Room[]>(`${environment.apiUrl}/api/room/workspace`, {
          params: { id: workspaceId },
        })
        .pipe(
          tap({
            next: (rooms) => {
              this.roomStore.setRooms(
                rooms.map((room) => ({
                  ...room,
                  areaId: '',
                  workspaceId: workspaceId,
                }))
              ); // TODO get area id
            },
            error: (error) => {
              console.error(error);
            },
          })
        )
    );
  }

  public async getById(id: string) {
    await firstValueFrom(
      this.http
        .get<Room>(`${environment.apiUrl}/api/room`, {
          params: { id },
        })
        .pipe(
          tap({
            next: (room) => {
              this.roomStore.setRoom({ ...room, areaId: '', workspaceId: '' }); // TODO get workspace id and area id
            },
            error: (error) => {
              console.error(error);
            },
          })
        )
    );
  }

  public async createRoom(areaId: string, req: RoomRequest) {
    let isSuccess = true;
    await firstValueFrom(
      this.http
        .post<Room>(`${environment.apiUrl}/api/room`, {
          areaId,
          name: req.name,
          description: req.description,
        })
        .pipe(
          tap({
            next: (room) => {
              this.roomStore.setRoom({
                ...room,
                areaId: areaId,
                workspaceId: '',
              }); // TODO get workspace id
            },
            error: (error) => {
              console.error(error);
              isSuccess = false;
            },
          })
        )
    );
    return isSuccess;
  }

  public async updateRoom(id: string, req: RoomRequest) {
    let isSuccess = true;
    await firstValueFrom(
      this.http
        .put<Room>(
          `${environment.apiUrl}/api/room`,
          { name: req.name, description: req.description },
          { params: { id: id } }
        )
        .pipe(
          tap({
            next: (room) => {
              this.roomStore.setRoom({ ...room, areaId: '', workspaceId: '' }); // TODO get area id
            },
            error: (error) => {
              console.error(error);
              isSuccess = false;
            },
          })
        )
    );
    return isSuccess;
  }
}
