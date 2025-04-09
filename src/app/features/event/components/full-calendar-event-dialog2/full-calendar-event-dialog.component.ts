// import {
//   Component,
//   computed,
//   inject,
//   OnInit,
//   Signal,
//   signal,
//   viewChild,
// } from '@angular/core';
// import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
// import {
//   FormControl,
//   FormGroup,
//   ReactiveFormsModule,
//   Validators,
// } from '@angular/forms';
// import { MatButtonModule } from '@angular/material/button';
// import { MatDatepickerModule } from '@angular/material/datepicker';
// import {
//   MAT_DIALOG_DATA,
//   MatDialog,
//   MatDialogRef,
// } from '@angular/material/dialog';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatProgressSpinner } from '@angular/material/progress-spinner';
// import { MatSelectModule } from '@angular/material/select';
// import { MatTimepickerModule } from '@angular/material/timepicker';
// import {
//   FullCalendarComponent,
//   FullCalendarModule,
// } from '@fullcalendar/angular';
// import {
//   CalendarOptions,
//   EventInput,
//   EventSourceFuncArg,
// } from '@fullcalendar/core/index.js';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
// import {
//   ResourceFuncArg,
//   ResourceInput,
// } from '@fullcalendar/resource/index.js';
// import { debounceTime, distinctUntilChanged, tap } from 'rxjs';
// import { RepetitionComponent } from '../../../../shared/components/repetition/repetition.component';
// import { Repetition } from '../../../../shared/models/repetition';
// import { isFutureDate } from '../../../../shared/utils/validators';
// import { EventCategoryStore } from '../../../event-category/event-category.store';
// import { MemberStore } from '../../../member/services/member.store';
// import { RoomStore } from '../../../room/room.store';
// import { WorkspaceStore } from '../../../workspace/workspace.store';
// import { Event, EventRequestForm } from '../../models/event';
// import { EventStore2 } from '../../services/event.store2';
// @Component({
//   selector: 'app-full-calendar-event-dialog2',
//   imports: [
//     ReactiveFormsModule,
//     MatFormFieldModule,
//     MatSelectModule,
//     MatTimepickerModule,
//     MatInputModule,
//     MatDatepickerModule,
//     MatProgressSpinner,
//     MatButtonModule,
//     FullCalendarModule,
//   ],
//   templateUrl: './full-calendar-event-dialog.component.html',
//   styleUrl: './full-calendar-event-dialog.component.scss',
// })
// export class FullCalendarEventDialogComponent2 implements OnInit {
//   private readonly matDialog = inject(MatDialog);
//   private readonly matDialogRef = inject(
//     MatDialogRef<FullCalendarEventDialogComponent2>
//   );
//   private readonly eventStore = inject(EventStore2);
//   private readonly eventCategoryStore = inject(EventCategoryStore);
//   private readonly roomStore = inject(RoomStore);
//   private readonly workspaceStore = inject(WorkspaceStore);
//   private readonly memberStore = inject(MemberStore);
//   private readonly fullCalendar = viewChild(FullCalendarComponent);
//   private readonly matDialogData: {
//     event: Event | null;
//     start: Date | null;
//     end: Date | null;
//   } = inject(MAT_DIALOG_DATA);

//   public event = signal(this.matDialogData.event);
//   public isLoading = signal(false);
//   public isUpdate = computed(() => !!this.event());
//   public form = new FormGroup<EventRequestForm>(
//     {
//       description: new FormControl(
//         {
//           value: this.event()?.description,
//           disabled: this.isLoading(),
//         },
//         { nonNullable: true }
//       ),
//       startDate: new FormControl(
//         {
//           value:
//             this.event()?.startDate || this.matDialogData.start || new Date(),
//           disabled: this.isLoading(),
//         },
//         { nonNullable: true, validators: [Validators.required] }
//       ),
//       endDate: new FormControl(
//         {
//           value: this.event()?.endDate || this.matDialogData.end || new Date(),
//           disabled: this.isLoading(),
//         },
//         { nonNullable: true, validators: [Validators.required] }
//       ),
//       eventCategoryId: new FormControl(
//         {
//           value: '',
//           disabled: this.isLoading(),
//         },
//         { nonNullable: true, validators: [Validators.required] }
//       ),
//       workspaceId: new FormControl(
//         {
//           value: '',
//           disabled: this.isLoading(),
//         },
//         { nonNullable: true, validators: [Validators.required] }
//       ),
//       roomId: new FormControl(
//         {
//           value: this.event()?.roomId ?? '',
//           disabled: this.isLoading(),
//         },
//         { nonNullable: true, validators: [Validators.required] }
//       ),
//       tagIds: new FormControl(
//         {
//           value: this.event()?.tagIds ?? [],
//           disabled: this.isLoading(),
//         },
//         { nonNullable: true }
//       ),
//       participantIds: new FormControl(
//         {
//           value: this.event()?.participantIds ?? [],
//           disabled: this.isLoading(),
//         },
//         { nonNullable: true }
//       ),
//       userIds: new FormControl(
//         {
//           value: this.event()?.userIds ?? [],
//           disabled: this.isLoading(),
//         },
//         { nonNullable: true }
//       ),
//       repetitionInterval: new FormControl(
//         {
//           value: this.event()?.repetitionInterval,
//           disabled: this.isLoading(),
//         },
//         { nonNullable: true }
//       ),
//       repetitionNumber: new FormControl(
//         {
//           value: this.event()?.repetitionNumber,
//           disabled: this.isLoading(),
//         },
//         { nonNullable: true }
//       ),
//       repetitionEndDate: new FormControl(
//         {
//           value: this.event()?.repetitionEndDate,
//           disabled: this.isLoading(),
//         },
//         { nonNullable: true }
//       ),
//     },
//     { validators: [isFutureDate] }
//   );
//   public eventCategories =
//     this.eventCategoryStore.eventCategoriesBySelectedWorkspace;
//   public workspaces = this.workspaceStore.workspaces;
//   public members = this.memberStore.membersBySelectedWorkspaceId;
//   public rooms = this.roomStore.roomsBySelectedWorkspaceId;
//   public selectedUserIds = signal<string[]>([]);
//   public selectedMembers = computed(() =>
//     this.members()
//       .filter((m) => this.selectedUserIds().includes(m.id))
//       .map((m) => ({ id: m.id, title: `${m.firstName} ${m.lastName}` }))
//   );
//   public selectedRoomId = signal<string>('');
//   public selectedRoom = computed(() => {
//     const room = this.rooms().find((r) => r.id === this.selectedRoomId());
//     return room ? { id: room.id, title: room.name } : null;
//   });
//   public resources = computed(() =>
//     this.selectedRoom()
//       ? [...this.selectedMembers(), this.selectedRoom()!]
//       : [...this.selectedMembers()]
//   );
//   public canShowCalendar = computed(() => this.resources().length > 0);
//   public startDate = toSignal(this.form.controls.startDate.valueChanges);
//   public endDate = toSignal(this.form.controls.endDate.valueChanges);
//   public eventDuration = computed(() => {
//     const diff = this.endDate()!.getDate() - this.startDate()!.getDate(); // TODO a changer faut faire avec les timestamps et des calculs ou voir
//     return diff > 0 ? diff + 1 : 1;
//   });
//   public calendarApi = computed(() => this.fullCalendar()?.getApi());

//   public calendarOptions: Signal<CalendarOptions> = computed(() => ({
//     initialView: 'customRessourceTimeGridDay',
//     headerToolbar: false,
//     plugins: [resourceTimeGridPlugin, dayGridPlugin],
//     views: {
//       customRessourceTimeGridDay: {
//         type: 'resourceTimeGrid',
//         duration: { days: this.eventDuration() },
//       },
//     },
//     allDaySlot: false,
//     slotDuration: '00:05:00',
//     schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
//     events: this.fetch.bind(this),
//     resources: this.handleResources.bind(this),
//     scrollTime: {
//       hour: this.startDate()!.getHours(),
//       minute: this.startDate()!.getMinutes(),
//     },
//     initialDate: this.startDate()!,
//   }));

//   public temporaryEvents: Signal<EventInput[]> = computed(() =>
//     this.resources().map((r) => ({
//       start: this.startDate()!,
//       end: this.endDate()!,
//       title: 'test',
//       color: 'red',
//       resourceId: r.id,
//     }))
//   );

//   public selectUsersEvent: Signal<EventInput[]> = computed(() =>
//     this.eventStore.selectedEventDialogUserIds().map((userId) =>
//       this.eventStore
//         .dialogEvents()
//         .filter((dialogEvent) => dialogEvent.userIds.includes(userId))
//         .map((event) => ({
//           start: event.startDate,
//           end: event.endDate,
//           title: event.id,
//           color: 'blue',
//           resourceId: userId,
//         }))
//     )
//   );

//   public events = computed(() => [
//     ...this.selectUsersEvent(),
//     ...this.temporaryEvents(),
//   ]);

//   constructor() {
//     this.form.valueChanges
//       .pipe(
//         debounceTime(200),
//         distinctUntilChanged(),
//         tap((formValue) => {
//           if (formValue.workspaceId) {
//             this.roomStore.setSelectedWorkspaceId(formValue.workspaceId);
//             this.memberStore.setSelectedWorkspaceId(formValue.workspaceId);
//             this.eventCategoryStore.setSelectedWorkspaceId(
//               formValue.workspaceId
//             );
//             this.roomStore.getRoomsByWorkspaceId();
//             this.memberStore.getMembersByWorkspaceId();
//             this.eventCategoryStore.getEventCategoriesByWorkspaceId();
//           }
//           if (formValue.userIds) {
//             this.selectedUserIds.set(formValue.userIds);
//             this.eventStore.setSelectedEventDialogUserIds(formValue.userIds);
//           }
//           if (formValue.roomId) {
//             this.selectedRoomId.set(formValue.roomId);
//             this.eventStore.setSelectedEventDialogRoomId(formValue.roomId);
//           }
//           if (formValue.startDate && formValue.endDate) {
//             this.eventStore.setSelectedEventDialogRange({
//               start: formValue.startDate,
//               end: formValue.endDate,
//             });
//           }
//           if (
//             formValue.workspaceId &&
//             (formValue.roomId ||
//               (formValue.userIds?.length && formValue.userIds?.length > 0))
//           ) {
//             console.log('la');
//             console.log(this.events());
//             this.calendarApi()?.refetchResources();
//             this.calendarApi()?.refetchEvents();
//           }
//         }),
//         takeUntilDestroyed()
//       )
//       .subscribe();
//   }

//   ngOnInit(): void {
//     this.workspaceStore.getWorkspaces();
//   }

//   private handleResources(
//     arg: ResourceFuncArg,
//     successCallback: (resourceInputs: ResourceInput[]) => void,
//     failureCallback: (error: Error) => void
//   ): void {
//     successCallback(this.resources());
//   }

//   private fetch(
//     arg: EventSourceFuncArg,
//     successCallback: (eventInputs: EventInput[]) => void,
//     failureCallback: (error: Error) => void
//   ): void {
//     this.eventStore.getDialogEvents();
//     successCallback(this.events());
//   }

//   public close() {
//     this.matDialogRef.close();
//   }

//   public openRepetitionDialog() {
//     const repetition: Repetition = {
//       number: this.event()?.repetitionNumber,
//       interval: this.event()?.repetitionInterval,
//       days: [],
//       endDate: this.event()?.repetitionEndDate,
//     };
//     this.matDialog.open(RepetitionComponent, { data: repetition });
//   }

//   public submit() {
//     if (this.form.valid) {
//       const req = this.form.getRawValue();
//       if (this.event()) {
//         this.eventStore.updateEvent(this.event()!.id, req).subscribe((res) => {
//           if (res) {
//             this.matDialogRef.close(res);
//           }
//         });
//       } else {
//         this.eventStore.createEvent(req).subscribe((res) => {
//           if (res) {
//             this.matDialogRef.close(res);
//           }
//         });
//       }
//     }
//   }
// }
