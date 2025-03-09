import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Room } from '../../room';
import { RoomStore } from '../../room.store';

@Component({
  selector: 'app-room-details',
  imports: [],
  templateUrl: './room-details.component.html',
  styleUrl: './room-details.component.scss',
})
export class RoomDetailsComponent implements OnInit {
  private readonly roomStore = inject(RoomStore);
  private readonly route = inject(ActivatedRoute);

  public loading = this.roomStore.isLoading;
  public room = signal<Room | null>(null);
  public roomId = signal(this.route.snapshot.paramMap.get('id'));

  public ngOnInit(): void {
    if (this.roomId()) {
      this.roomStore.setSelectedRoomId(this.roomId()!);
      this.roomStore.getRoomById();
    } else {
      // TODO faire un redirect ou un truc du genre jsp
    }
  }
}
