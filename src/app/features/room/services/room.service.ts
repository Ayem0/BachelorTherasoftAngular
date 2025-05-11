import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Id } from '../../../shared/models/entity';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
import { TranslateService } from '../../../shared/services/translate/translate.service';
import { Room, RoomRequest, UNKNOW_ROOM } from '../models/room';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly sonner = inject(SonnerService);
  private readonly translate = inject(TranslateService);

  public roomsByWorkspaceId(id: Id): Signal<Room[]> {
    return computed(() =>
      this.store.workspacesRooms().has(id)
        ? Array.from(
            this.store.workspacesRooms().get(id)!,
            (i) => this.store.rooms().get(i) ?? UNKNOW_ROOM
          )
        : []
    );
  }

  public roomById(id: Id | null | undefined): Signal<Room | undefined> {
    return computed(() => (id ? this.store.rooms().get(id) : undefined));
  }

  public roomByAreaId(id: Signal<Id>): Signal<Room[]> {
    return computed(() =>
      this.store.areasRooms().has(id())
        ? Array.from(
            this.store.areasRooms().get(id())!,
            (i) => this.store.rooms().get(i) ?? UNKNOW_ROOM
          )
        : []
    );
  }

  public async getRoomsByAreaId(id: string) {
    await firstValueFrom(
      this.http
        .get<Room[]>(`${environment.apiUrl}/api/room/area?id=${id}`)
        .pipe(
          tap({
            next: (rooms) => {
              this.store.setEntities('rooms', rooms);
            },
            error: (error) => {
              console.error(error);
              this.sonner.error(this.translate.translate('room.get.error'));
            },
          })
        )
    );
  }

  public async getRoomsByWorkspaceId(workspaceId: string) {
    await firstValueFrom(
      this.http
        .get<Room[]>(
          `${environment.apiUrl}/api/room/workspace?id=${workspaceId}`
        )
        .pipe(
          tap({
            next: (rooms) => {
              this.store.setEntities('rooms', rooms);
            },
            error: (error) => {
              console.error(error);
              this.sonner.error(this.translate.translate('room.get.error'));
            },
          })
        )
    );
  }

  public async getById(id: string) {
    await firstValueFrom(
      this.http.get<Room>(`${environment.apiUrl}/api/room?id=${id}`).pipe(
        tap({
          next: (room) => {
            this.store.setEntity('rooms', room);
          },
          error: (error) => {
            console.error(error);
            this.sonner.error(this.translate.translate('room.get.error'));
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
          ...req,
          areaId,
        })
        .pipe(
          tap({
            next: (room) => {
              this.store.setEntity('rooms', room);
              this.sonner.success(
                this.translate.translate('room.create.success')
              );
            },
            error: (error) => {
              console.error(error);
              isSuccess = false;
              this.sonner.error(this.translate.translate('room.create.error'));
            },
          })
        )
    );
    return isSuccess;
  }

  public async updateRoom(id: string, req: RoomRequest) {
    let isSuccess = true;
    await firstValueFrom(
      this.http.put<Room>(`${environment.apiUrl}/api/room?id=${id}`, req).pipe(
        tap({
          next: (room) => {
            this.store.setEntity('rooms', room);
            this.sonner.success(
              this.translate.translate('room.update.success')
            );
          },
          error: (error) => {
            console.error(error);
            isSuccess = false;
            this.sonner.error(this.translate.translate('room.update.error'));
          },
        })
      )
    );
    return isSuccess;
  }
}
