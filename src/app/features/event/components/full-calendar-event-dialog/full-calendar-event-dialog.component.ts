import { Component, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { FullCalendarModule } from '@fullcalendar/angular';
import { debounceTime, distinctUntilChanged, forkJoin, tap } from 'rxjs';
import { RepetitionComponent } from '../../../../shared/components/repetition/repetition.component';
import { Id } from '../../../../shared/models/entity';
import { Repetition } from '../../../../shared/models/repetition';
import { isFutureDate } from '../../../../shared/utils/validators';
import { EventCategoryService } from '../../../event-category/services/event-category.service';
import { MemberService } from '../../../member/services/member.service';
import { RoomService } from '../../../room/services/room.service';
import { TagService } from '../../../tag/services/tag.service';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { EventRequestForm } from '../../models/event';
import { EventService } from '../../services/event.service';
@Component({
  selector: 'app-full-calendar-event-dialog',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTimepickerModule,
    MatInputModule,
    MatDatepickerModule,
    MatProgressSpinner,
    MatButtonModule,
    FullCalendarModule,
  ],
  templateUrl: './full-calendar-event-dialog.component.html',
  styleUrl: './full-calendar-event-dialog.component.scss',
})
export class FullCalendarEventDialogComponent implements OnInit {
  private readonly matDialog = inject(MatDialog);
  private readonly matDialogRef = inject(
    MatDialogRef<FullCalendarEventDialogComponent>
  );
  private readonly matDialogData: {
    eventId: Id | null;
    start: Date | null;
    end: Date | null;
  } = inject(MAT_DIALOG_DATA);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly eventService = inject(EventService);
  private readonly eventCategoryService = inject(EventCategoryService);
  private readonly tagService = inject(TagService);
  private readonly roomService = inject(RoomService);
  private readonly memberService = inject(MemberService);

  public event = this.eventService.detailedEvent(this.matDialogData.eventId);
  public isLoading = signal(false);
  public isLoadingRes = signal(false);
  public isSubmitting = signal(false);

  public isUpdate = !!this.matDialogData.eventId;
  public form = new FormGroup<EventRequestForm>(
    {
      description: new FormControl(
        {
          value: this.event()?.description,
          disabled: this.isSubmitting(),
        },
        { nonNullable: true }
      ),
      startDate: new FormControl(
        {
          value:
            this.event()?.startDate || this.matDialogData.start || new Date(),
          disabled: this.isSubmitting(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      endDate: new FormControl(
        {
          value: this.event()?.endDate || this.matDialogData.end || new Date(),
          disabled: this.isSubmitting(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      eventCategoryId: new FormControl(
        {
          value: this.event()?.eventCategoryId || '',
          disabled: this.isSubmitting(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      workspaceId: new FormControl(
        {
          value: this.event()?.workspaceId || '',
          disabled: this.isSubmitting(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      roomId: new FormControl(
        {
          value: this.event()?.roomId ?? '',
          disabled: this.isSubmitting(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      tagIds: new FormControl(
        {
          value: this.event()?.tagIds ?? [],
          disabled: this.isSubmitting(),
        },
        { nonNullable: true }
      ),
      participantIds: new FormControl(
        {
          value: this.event()?.participantIds ?? [],
          disabled: this.isSubmitting(),
        },
        { nonNullable: true }
      ),
      userIds: new FormControl(
        {
          value: this.event()?.userIds ?? [],
          disabled: this.isSubmitting(),
        },
        { nonNullable: true }
      ),
      repetitionInterval: new FormControl(
        {
          value: this.event()?.repetitionInterval,
          disabled: this.isSubmitting(),
        },
        { nonNullable: true }
      ),
      repetitionNumber: new FormControl(
        {
          value: this.event()?.repetitionNumber,
          disabled: this.isSubmitting(),
        },
        { nonNullable: true }
      ),
      repetitionEndDate: new FormControl(
        {
          value: this.event()?.repetitionEndDate,
          disabled: this.isSubmitting(),
        },
        { nonNullable: true }
      ),
    },
    { validators: [isFutureDate] }
  );
  private workspaceId = signal(this.form.controls.workspaceId.value);
  public workspaces = this.workspaceService.workspaces();
  public eventCategories =
    this.eventCategoryService.eventCategoriesByWorkspaceId(this.workspaceId);
  public members = this.memberService.membersByWorkspaceId(this.workspaceId);
  public rooms = this.roomService.roomsByWorkspaceId(this.workspaceId);
  public tags = this.tagService.tagsByWorkspaceId(this.workspaceId);
  // public selectedUserIds = signal<string[]>([]);
  // public selectedMembers = computed(() =>
  //   this.members()
  //     .filter((m) => this.selectedUserIds().includes(m.id))
  //     .map((m) => ({ id: m.id, title: `${m.firstName} ${m.lastName}` }))
  // );
  // private readonly fullCalendar = viewChild(FullCalendarComponent);
  // public selectedRoomId = signal<string>('');
  // public selectedRoom = computed(() => {
  //   const room = this.rooms().find((r) => r.id === this.selectedRoomId());
  //   return room ? { id: room.id, title: room.name } : null;
  // });
  // public resources = computed(() =>
  //   this.selectedRoom()
  //     ? [...this.selectedMembers(), this.selectedRoom()!]
  //     : [...this.selectedMembers()]
  // );
  // public canShowCalendar = computed(() => this.resources().length > 0);
  // public startDate = toSignal(this.form.controls.startDate.valueChanges);
  // public endDate = toSignal(this.form.controls.endDate.valueChanges);
  // public eventDuration = computed(() => {
  //   const diff = this.endDate()!.getDate() - this.startDate()!.getDate();
  //   return diff > 0 ? diff + 1 : 1;
  // });
  // public calendarApi = computed(() => this.fullCalendar()?.getApi());

  // public calendarOptions: Signal<CalendarOptions> = computed(() => ({
  //   initialView: 'customRessourceTimeGridDay',
  //   headerToolbar: false,
  //   plugins: [resourceTimeGridPlugin, dayGridPlugin],
  //   // resources: this.resources(),
  //   views: {
  //     customRessourceTimeGridDay: {
  //       type: 'resourceTimeGrid',
  //       duration: { days: this.eventDuration() },
  //     },
  //   },
  //   allDaySlot: false,
  //   slotDuration: '00:05:00',
  //   schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
  //   events: this.fetch.bind(this),
  //   resources: this.handleResources.bind(this),
  //   scrollTime: {
  //     hour: this.startDate()!.getHours(),
  //     minute: this.startDate()!.getMinutes(),
  //   },
  //   initialDate: this.startDate()!,
  // }));

  // public temporaryEvents: Signal<EventInput[]> = computed(() =>
  //   this.resources().map((r) => ({
  //     start: this.startDate()!,
  //     end: this.endDate()!,
  //     title: 'test',
  //     resourceId: r.id,
  //   }))
  // );

  constructor() {
    this.form.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap((formValue) => {
          if (formValue.workspaceId) {
            this.workspaceId.set(formValue.workspaceId);
            this.isLoadingRes.set(true);
            forkJoin([
              this.roomService.getRoomsByWorkspaceId(formValue.workspaceId),
              this.memberService.getMembersByWorkspaceId(formValue.workspaceId),
              this.eventCategoryService.getEventCategoriesByWorkspaceId(
                formValue.workspaceId
              ),
              this.tagService.getTagsByWorkspaceId(formValue.workspaceId),
            ]).subscribe(() => this.isLoadingRes.set(false));
          }
        }),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.isLoading.set(true);
    if (this.event())
      this.workspaceService
        .getWorkspaces()
        .subscribe(() => this.isLoading.set(false));
  }

  public close() {
    this.matDialogRef.close();
  }

  public openRepetitionDialog() {
    const repetition: Repetition = {
      number: this.event()?.repetitionNumber,
      interval: this.event()?.repetitionInterval,
      days: [],
      endDate: this.event()?.repetitionEndDate,
    };
    this.matDialog.open(RepetitionComponent, { data: repetition });
  }

  public submit() {
    if (this.form.valid) {
      const req = this.form.getRawValue();
      console.log(req);
      this.eventService.createEvent(req).subscribe((res) => {
        if (res) {
          this.matDialogRef.close();
        }
      });
    }
  }

  // private handleResources(
  //   arg: ResourceFuncArg,
  //   successCallback: (resourceInputs: ResourceInput[]) => void,
  //   failureCallback: (error: Error) => void
  // ): void {
  //   successCallback(this.resources());
  // }

  // private fetch(
  //   arg: EventSourceFuncArg,
  //   successCallback: (eventInputs: EventInput[]) => void,
  //   failureCallback: (error: Error) => void
  // ): void {
  //   successCallback(this.temporaryEvents());
  // }

  // public submit() {
  //   if (this.form.valid) {
  //     const req = this.form.getRawValue();
  //     if (this.event()) {
  //       this.eventStore
  //         .updateEvent(this.event()!.id, req)
  //         .pipe(
  //           tap((res) => {
  //             this.matDialogRef.close(res);
  //           }),
  //           catchError((err) => {
  //             console.log(err);
  //             return of();
  //           })
  //         )
  //         .subscribe();
  //     } else {
  //       this.eventStore
  //         .createEvent(req)
  //         .pipe(
  //           tap((res) => {
  //             this.matDialogRef.close(res);
  //           }),
  //           catchError((err) => {
  //             console.log(err);
  //             return of();
  //           })
  //         )
  //         .subscribe();
  //     }
  //   }
  // }
}
