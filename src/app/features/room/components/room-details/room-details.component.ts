import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-room-details',
  imports: [],
  templateUrl: './room-details.component.html',
  styleUrl: './room-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomDetailsComponent {
  // private readonly roomService = inject(RoomService);
  // private readonly route = inject(ActivatedRoute);
  // public isLoading = signal(false);
  // public roomId = signal(this.route.snapshot.paramMap.get('id'));
  // public room = this.roomService.roomBySelectedRoomId;
  // public async ngOnInit() {
  //   if (this.roomId()) {
  //     this.roomService.selectedRoomId.set(this.roomId()!);
  //     this.isLoading.set(true);
  //     await this.roomService.getById(this.roomId()!);
  //     this.isLoading.set(false);
  //   } else {
  //     // TODO faire un redirect ou un truc du genre jsp
  //   }
  // }
}
