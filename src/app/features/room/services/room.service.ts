import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, Signal } from '@angular/core';
import { catchError, debounceTime, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Id } from '../../../shared/models/entity';
import { SonnerService } from '../../../shared/services/sonner/sonner.service';
import { Store } from '../../../shared/services/store/store';
import { TranslateService } from '../../../shared/services/translate/translate.service';
import { Room, RoomRequest, UNKNOWN_ROOM } from '../models/room';

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
            (i) => this.store.rooms().get(i) ?? UNKNOWN_ROOM
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
            (i) => this.store.rooms().get(i) ?? UNKNOWN_ROOM
          )
        : []
    );
  }

  public getRoomsByAreaId(areaId: string): Observable<Room[]> {
    if (this.store.areasRooms().has(areaId)) return of([]);
    return this.http
      .get<Room[]>(`${environment.apiUrl}/area/${areaId}/rooms`)
      .pipe(
        debounceTime(150),
        tap((rooms) => {
          this.store.setEntities('rooms', rooms);
          this.store.setRelation(
            'areasRooms',
            areaId,
            rooms.map((r) => r.id)
          );
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.translate.translate('room.get.error'));
          return of([]);
        })
      );
  }

  public getRoomsByWorkspaceId(workspaceId: string) {
    if (this.store.workspacesRooms().has(workspaceId)) return of([]);
    return this.http
      .get<Room[]>(`${environment.apiUrl}/workspace/${workspaceId}/rooms`)
      .pipe(
        debounceTime(150),
        tap((rooms) => {
          this.store.setEntities('rooms', rooms);
          this.store.setRelation(
            'workspacesRooms',
            workspaceId,
            rooms.map((r) => r.id)
          );
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.translate.translate('room.get.error'));
          return of([]);
        })
      );
  }

  public getById(id: string) {
    if (this.store.rooms().has(id)) return of(this.store.rooms().get(id)!);
    return this.http.get<Room>(`${environment.apiUrl}/room/${id}`).pipe(
      debounceTime(150),
      tap((room) => this.store.setEntity('rooms', room)),
      catchError((err) => {
        console.error(err);
        this.sonner.error(this.translate.translate('room.get.error'));
        return of(null);
      })
    );
  }

  public createRoom(areaId: string, req: RoomRequest) {
    return this.http
      .post<Room>(`${environment.apiUrl}/room`, {
        areaId,
        ...req,
      })
      .pipe(
        debounceTime(150),
        map((room) => {
          this.store.setEntity('rooms', room);
          this.store.addToRelation('areasRooms', areaId, room.id);
          this.sonner.success(this.translate.translate('room.create.success'));
          return true;
        }),
        catchError((err) => {
          console.error(err);
          this.sonner.error(this.translate.translate('room.create.error'));
          return of(false);
        })
      );
  }

  public updateRoom(id: string, req: RoomRequest) {
    return this.http.put<Room>(`${environment.apiUrl}/room/${id}`, req).pipe(
      debounceTime(150),
      map((room) => {
        this.store.setEntity('rooms', room);
        this.sonner.success(this.translate.translate('room.update.success'));
        return true;
      }),
      catchError((err) => {
        console.error(err);
        this.sonner.error(this.translate.translate('room.update.error'));
        return of(false);
      })
    );
  }
}
