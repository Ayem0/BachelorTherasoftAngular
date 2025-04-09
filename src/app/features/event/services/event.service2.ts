// import { HttpClient } from '@angular/common/http';
// import { inject, Injectable } from '@angular/core';
// import dayjs from 'dayjs';
// import { tap } from 'rxjs';
// import { environment } from '../../../../environments/environment';
// import { SonnerService } from '../../../shared/services/sonner/sonner.service';
// import { EventCategory } from '../../event-category/models/event-category';
// import { EventCategoryStore3 } from '../../event-category/services/event-category.store3';
// import { Member } from '../../member/member';
// import { Participant } from '../../participant/participant';
// import { Room } from '../../room/models/room';
// import { Tag } from '../../tag/models/tag';
// import { Workspace } from '../../workspace/models/workspace';
// import { Event, EventRequest } from '../models/event';
// import { EventStore3 } from './event.store3';
// import { MemberStore } from '../../member/services/member.store';
// import { TagStore } from '../../tag/services/tag.store';
// import { ParticipantStore } from '../../participant/services/participant.store';
// import { RoomStore2 } from '../../room/services/room.store2';
// import { WorkspaceStore } from '../../workspace/services/workspace.store';

// @Injectable({
//   providedIn: 'root',
// })
// export class EventService2 {
//   private readonly http = inject(HttpClient);
//   private readonly eventStore = inject(EventStore3);
//   private readonly eventCategoryStore = inject(EventCategoryStore3);
//   private readonly memberStore = inject(MemberStore);
//   private readonly tagStore = inject(TagStore);
//   private readonly participantStore = inject(ParticipantStore);
//   private readonly roomStore = inject(RoomStore2);
//   private readonly workspaceStore = inject(WorkspaceStore);
//   private readonly sonner = inject(SonnerService);

//   public getById(id: string) {
//     return this.http.get<Event>(`${environment.apiUrl}/api/event`, {
//       params: { id },
//     });
//   }

//   public async createEvent(request: EventRequest) {
//     return this.http
//       .post<
//         Event<{
//           members: Member[];
//           room: Room;
//           workspace: Workspace;
//           eventCategory: EventCategory;
//           participants: Participant[];
//           tags: Tag[];
//         }>
//       >(`${environment.apiUrl}/api/event`, request)
//       .pipe(
//         tap({
//           next: (event) => {
//             this.eventStore.setEvent({
//               id: event.id,
//               endDate: event.endDate,
//               startDate: event.startDate,
//               description: event.description,
//               repetitionInterval: event.repetitionInterval,
//               repetitionNumber: event.repetitionNumber,
//               repetitionEndDate: event.repetitionEndDate,
//               eventCategoryId: event.eventCategory.id,
//               roomId: event.room.id,
//               tagIds: event.tags.map((tag) => tag.id),
//               participantIds: event.participants.map(
//                 (participant) => participant.id
//               ),
//               memberIds: event.members.map((member) => member.id),
//               workspaceId: event.workspace.id,
//             });
//             this.eventCategoryStore.setEventCategory({
//               id: event.eventCategory.id,
//               name: event.eventCategory.name,
//               color: event.eventCategory.color,
//               workspaceId: event.workspace.id,
//               icon: event.eventCategory.icon,
//               description: event.eventCategory.description,
//             });
//             // this.memberStore.setMembers(event.members);
//             this.tagStore.setTags(event.tags);
//             // this.participantStore.setParticipants(event.participants);
//             // this.roomStore.setRoom(event.room);
//             this.workspaceStore.setWorkspace(event.workspace);
//             this.sonner.success(
//               'Event has been created',
//               dayjs(event.startDate).format('dddd, MMMM DD, YYYY [at] HH:mm')
//             );
//           },
//           error: (err) => {
//             console.error(err);
//             this.sonner.error('Event could not be created');
//           },
//         })
//       );
//   }
// }
