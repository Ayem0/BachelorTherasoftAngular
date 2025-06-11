import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import {
  MatDatepickerInputEvent,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import {
  MatSlideToggle,
  MatSlideToggleChange,
} from '@angular/material/slide-toggle';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatTooltip } from '@angular/material/tooltip';
import {
  FullCalendarComponent,
  FullCalendarModule,
} from '@fullcalendar/angular';
import {
  CalendarOptions,
  DatesSetArg,
  EventInput,
  EventSourceFuncArg,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import {
  default as momentPlugin,
  default as momentTimezonePlugin,
} from '@fullcalendar/moment';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import {
  ResourceFuncArg,
  ResourceInput,
} from '@fullcalendar/resource/index.js';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, forkJoin, tap } from 'rxjs';
import { User } from '../../../../core/auth/models/auth';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { Entity } from '../../../../shared/models/entity';
import { DateService } from '../../../../shared/services/date/date.service';
import { LocaleService } from '../../../../shared/services/locale/locale.service';
import { isFutureDate } from '../../../../shared/utils/validators';
import { EventCategory } from '../../../event-category/models/event-category';
import { EventCategoryService } from '../../../event-category/services/event-category.service';
import { MemberService } from '../../../member/services/member.service';
import { Participant } from '../../../participant/models/participant';
import { ParticipantService } from '../../../participant/services/participant.service';
import { Room } from '../../../room/models/room';
import { RoomService } from '../../../room/services/room.service';
import { Tag } from '../../../tag/models/tag';
import { TagService } from '../../../tag/services/tag.service';
import { Workspace } from '../../../workspace/models/workspace';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import {
  DateRange,
  Event,
  EventRequest,
  EventRequestForm,
} from '../../models/event';
import { AgendaService } from '../../services/agenda.service';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-details',
  imports: [
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    TranslateModule,
    MatProgressSpinner,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatCardModule,
    MatTooltip,
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    MatAutocompleteModule,
    FullCalendarModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatMenuModule,
    MatSlideToggle,
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        subscriptSizing: 'dynamic',
      },
    },
  ],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDetailsComponent {
  private readonly matdialogRef = inject(MatDialogRef<EventDetailsComponent>);
  private readonly matDialogData: {
    eventId?: string;
    start?: Date;
    end?: Date;
  } = inject(MAT_DIALOG_DATA);
  private readonly eventId = this.matDialogData.eventId;
  private readonly eventService = inject(EventService);
  private readonly eventCategoryService = inject(EventCategoryService);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly memberService = inject(MemberService);
  private readonly participantService = inject(ParticipantService);
  private readonly tagService = inject(TagService);
  private readonly roomService = inject(RoomService);
  private readonly locale = inject(LocaleService);
  private readonly date = inject(DateService);
  private readonly agendaService = inject(AgendaService);
  private readonly authService = inject(AuthService);

  private readonly fullCalendar = viewChild(FullCalendarComponent);

  public currentLocal = computed(() =>
    this.locale.currentLang() === 'en' ? 'en-US' : 'fr-FR'
  );
  public isLoadingEvent = signal(false);
  public isSubmitting = signal(false);

  public isLoadingWorkspaces = signal(false);
  public isLoadingEcs = signal(false);
  public isLoadingRooms = signal(false);
  public isLoadingTags = signal(false);
  public isLoadingUsers = signal(false);
  public isLoadingParticipants = signal(false);
  public localeOffsetName = this.locale.localeOffsetName;
  public dateTitle = signal('');
  public viewMode = signal<'resourceTimeGridDay' | 'resourceTimeGridWeek'>(
    'resourceTimeGridDay'
  );

  public isFormMode = signal(false);
  public isLoadingPlanner = signal(false);
  public isPlannerOpen = signal(false);
  public isUpdate = signal(!!this.eventId);
  public canShowPlanner = computed(
    () => this.resources().length > 0 && this.start() < this.end()
  );
  public showWeekend = this.agendaService.showWeekend;

  public event = this.eventService.detailedEvent(this.eventId);
  public workspaceId = signal(this.event()?.workspaceId ?? '');
  public eventCategories =
    this.eventCategoryService.eventCategoriesByWorkspaceId(this.workspaceId);
  public tags = this.tagService.tagsByWorkspaceId(this.workspaceId);
  public rooms = this.roomService.roomsByWorkspaceId(this.workspaceId);
  public workspaces = this.workspaceService.workspaces();
  public users = this.memberService.membersByWorkspaceId(this.workspaceId);
  public participants = this.participantService.participantsByWorkspaceId(
    this.workspaceId
  );
  public selectedRoom = linkedSignal<Room | undefined>(
    () => this.event()?.room
  );
  public selectedUsers = linkedSignal<User[]>(() => this.event()?.users ?? []);
  public userInput = signal<string>('');
  public filteredUsers = computed(() =>
    this.users().filter(
      (user) =>
        `${user.firstName}${user.lastName}`
          .toLowerCase()
          .includes(this.userInput().trim().toLowerCase()) &&
        !this.selectedUsers()
          .map((su) => su.id)
          .includes(user.id)
    )
  );
  public participantInput = signal<string>('');
  public selectedParticipants = linkedSignal<Participant[]>(
    () => this.event()?.participants ?? []
  );
  public filteredParticipants = computed(() =>
    this.participants().filter(
      (participant) =>
        `${participant.firstName}${participant.lastName}`
          .toLowerCase()
          .includes(this.participantInput().trim().toLowerCase()) &&
        !this.selectedParticipants()
          .map((sp) => sp.id)
          .includes(participant.id)
    )
  );
  public isAssignedToMe = computed(() =>
    this.selectedUsers()
      .map((u) => u.id)
      .includes(this.authService.currentUserInfo()?.id ?? '')
  );
  public resources: Signal<ResourceInput[]> = computed(() => {
    const users = this.selectedUsers().map((u) => ({
      id: u.id,
      title: `${u.firstName} ${u.lastName}`,
    }));
    return this.selectedRoom()
      ? [
          ...users,
          { id: this.selectedRoom()!.id, title: this.selectedRoom()!.name },
        ]
      : [...users];
  });

  public assignToMe() {
    this.selectedUsers.update((users) => [
      ...users,
      this.authService.currentUserInfo()!,
    ]);
  }

  public start = signal(
    this.matDialogData.start
      ? new Date(this.matDialogData.start)
      : this.event()?.startDate
      ? new Date(this.event()!.startDate)
      : new Date()
  );
  public end = signal(
    this.matDialogData.end
      ? new Date(this.matDialogData.end)
      : this.event()?.endDate
      ? new Date(this.event()!.endDate)
      : new Date()
  );
  public selectedRange = signal<DateRange>({
    start: this.start(),
    end: this.date.incrementDate(new Date(), 1, 'day'),
  });

  public calendarApi = computed(() => this.fullCalendar()?.getApi());
  public duration = computed(() =>
    this.date.diffInDays(this.start(), this.end())
  );

  public calendarOptions: CalendarOptions = {
    initialView: this.viewMode(),
    duration: {
      days: this.duration(),
    },
    headerToolbar: {
      center: undefined,
      left: undefined,
      right: undefined,
    },
    plugins: [
      resourceTimeGridPlugin,
      dayGridPlugin,
      momentPlugin,
      momentTimezonePlugin,
    ],
    // resources: this.resources(),
    views: {
      resourceTimeGridWeek: {
        type: 'resourceTimeGrid',
        duration: { week: 1 },
        buttonText: 'Day',
      },
    },
    allDaySlot: false,
    height: '100%',
    firstDay: this.locale.currentLang() === 'fr' ? 1 : 0,
    handleWindowResize: true,
    expandRows: true,
    initialDate: this.start(),
    weekends: this.showWeekend(),
    locale: this.locale.currentLang(),
    timeZone: this.locale.currentTz(),
    slotDuration: '00:05:00',
    schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
    events: this.fetch.bind(this),
    resources: this.handleResources.bind(this),
    datesSet: this.handleDatesSet.bind(this),
    scrollTime: {
      hour: this.start().getUTCHours(),
      minute: this.start().getUTCMinutes(),
    },
  };

  public tagInput = signal<string>('');
  public selectedTags = linkedSignal<Tag[]>(() => this.event()?.tags ?? []);
  public filteredTags = computed(() =>
    this.tags().filter(
      (tag) =>
        tag.name.toLowerCase().includes(this.tagInput().trim().toLowerCase()) &&
        !this.selectedTags()
          .map((st) => st.id)
          .includes(tag.id)
    )
  );

  public workspacCtrl = new FormControl<Workspace | string>('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  public form = new FormGroup<EventRequestForm>(
    {
      description: new FormControl(undefined, { nonNullable: true }),
      startDate: new FormControl(this.start(), {
        nonNullable: true,
        validators: [Validators.required],
      }),
      endDate: new FormControl(this.end(), {
        nonNullable: true,
        validators: [Validators.required],
      }),
      eventCategory: new FormControl<EventCategory | string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      workspace: new FormControl<Workspace | string>('', {
        nonNullable: true,
      }),
      room: new FormControl<Room | string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      tags: new FormControl([], { nonNullable: true }),
      participants: new FormControl([], { nonNullable: true }),
      users: new FormControl([], { nonNullable: true }),
      repetitionInterval: new FormControl(undefined, { nonNullable: true }),
      repetitionNumber: new FormControl(undefined, { nonNullable: true }),
      repetitionEndDate: new FormControl(undefined, { nonNullable: true }),
    },
    { validators: [isFutureDate] }
  );

  public temporaryEvents: Signal<EventInput[]> = computed(() =>
    this.resources().map((r) => ({
      start: this.date.toLocaleString(this.start()),
      end: this.date.toLocaleString(this.end()),
      title: 'test',
      resourceId: r.id,
      color:
        typeof this.form.controls.eventCategory.value !== 'string'
          ? this.form.controls.eventCategory.value.color
          : undefined,
      backgroundColor:
        typeof this.form.controls.workspace.value !== 'string'
          ? this.form.controls.workspace.value.color
          : undefined,
      classNames: ['!shadow-none', 'border-0', 'border-l-8'],
    }))
  );

  constructor() {
    effect(() => {
      if (this.start() && this.end() && this.calendarApi()) {
        this.calendarApi()!.refetchEvents();
      }
    });

    effect(() => {
      if (this.isPlannerOpen() && this.calendarApi()) {
        this.calendarApi()?.setOption('weekends', this.showWeekend());
        this.calendarApi()?.changeView(this.viewMode());
      }
    });

    effect(() => {
      if (this.resources().length > 0 && this.calendarApi()) {
        this.calendarApi()!.refetchResources();
      }
    });

    this.workspacCtrl.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap((workspace) => {
          if (typeof workspace !== 'string') {
            this.workspaceId.set(workspace.id);
            this.isLoadingRooms.set(true);
            this.isLoadingTags.set(true);
            this.isLoadingEcs.set(true);
            this.isLoadingUsers.set(true);
            this.isLoadingParticipants.set(true);
            forkJoin([
              this.roomService.getRoomsByWorkspaceId(this.workspaceId()),
              this.memberService.getMembersByWorkspaceId(this.workspaceId()),
              this.eventCategoryService.getEventCategoriesByWorkspaceId(
                this.workspaceId()
              ),
              this.tagService.getTagsByWorkspaceId(this.workspaceId()),
            ]).subscribe(() => {
              this.isLoadingRooms.set(false);
              this.isLoadingTags.set(false);
              this.isLoadingEcs.set(false);
              this.isLoadingUsers.set(false);
              this.isLoadingParticipants.set(false);
            });
          }
        }),
        takeUntilDestroyed()
      )
      .subscribe();

    this.form.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap((formValue) => {
          if (formValue.startDate) {
            this.start.set(new Date(formValue.startDate));
          }
          if (formValue.endDate) {
            this.end.set(new Date(formValue.endDate));
          }
          if (formValue.room) {
            this.selectedRoom.set(
              typeof formValue.room === 'string' ? undefined : formValue.room
            );
          }
        }),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  public weekendFilter = this.agendaService.weekEndFilter;

  public viewModeChange(
    viewMode: 'resourceTimeGridDay' | 'resourceTimeGridWeek'
  ) {
    if (this.viewMode() !== viewMode) {
      this.viewMode.set(viewMode);
      this.calendarApi()?.changeView(viewMode);
    }
  }

  public showWeekendChange(event: MatSlideToggleChange) {
    this.agendaService.setShowWeekends(event.checked);
    this.calendarApi()?.setOption('weekends', this.showWeekend());
  }

  ngOnInit(): void {
    if (this.eventId) {
      this.isLoadingEvent.set(true);
      this.eventService.getById(this.eventId).subscribe(() => {
        this.form.patchValue({
          description: this.event()?.description ?? '',
          startDate: this.event()?.startDate ?? new Date(),
          endDate: this.event()?.endDate ?? new Date(),
          eventCategory: this.event()?.eventCategory ?? '',
          workspace: this.event()?.workspace ?? '',
          room: this.event()?.room ?? '',
          tags: this.event()?.tags ?? [],
          participants: this.event()?.participants ?? [],
          users: this.event()?.users ?? [],
          repetitionInterval: this.event()?.repetitionInterval ?? undefined,
          repetitionNumber: this.event()?.repetitionNumber ?? undefined,
          repetitionEndDate: this.event()?.repetitionEndDate ?? undefined,
        });
        this.workspacCtrl.setValue(this.event()?.workspace ?? '');
        this.workspacCtrl.disable();
        this.isLoadingEvent.set(false);
      });
    } else {
      this.isLoadingWorkspaces.set(true);
      this.toggleEditMode();
      this.workspaceService
        .getWorkspaces()
        .subscribe(() => this.isLoadingWorkspaces.set(false));
    }
  }

  public togglePlanner() {
    this.isPlannerOpen.update((x) => !x);
    if (this.isPlannerOpen()) {
      this.matdialogRef.updateSize('100%', '100%');
    } else {
      this.matdialogRef.updateSize('', '');
    }
  }

  public closeDialog(event?: Event): void {
    this.matdialogRef.close(event);
  }

  public dateChanged(
    event: MatDatepickerInputEvent<Date>,
    position: 'start' | 'end'
  ) {
    if (event.value) {
      if (position === 'start') {
        event.value.setHours(
          this.start().getHours(),
          this.start().getMinutes(),
          0,
          0
        );
        this.start.set(event.value);
      } else {
        event.value.setHours(
          this.end().getHours(),
          this.end().getMinutes(),
          0,
          0
        );
        this.end.set(event.value);
      }
    }
  }

  private handleResources(
    arg: ResourceFuncArg,
    successCallback: (resourceInputs: ResourceInput[]) => void,
    failureCallback: (error: Error) => void
  ): void {
    successCallback(this.resources());
  }

  private fetch(
    arg: EventSourceFuncArg,
    successCallback: (eventInputs: EventInput[]) => void,
    failureCallback: (error: Error) => void
  ): void {
    successCallback(this.temporaryEvents());
  }

  public toggleEditMode() {
    this.isFormMode.update((isEditMode) => !isEditMode);
    if (this.isFormMode()) {
      this.form.enable();
    } else {
      this.form.disable();
    }
  }

  public selected<T extends Entity>(
    e: MatAutocompleteSelectedEvent,
    signal: WritableSignal<T[]>
  ): void {
    signal.update((v) => [...v, e.option.value]);
  }

  public remove<T extends Entity>(item: T, signal: WritableSignal<T[]>) {
    signal.update((v) => v.filter((i) => i.id !== item.id));
  }

  public submit() {
    this.isSubmitting.set(true);
    if (this.form.valid) {
      const form = this.form.getRawValue();
      const workspace = this.workspacCtrl.value;
      const req: EventRequest = {
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate,
        repetitionEndDate: form.repetitionEndDate,
        repetitionInterval: form.repetitionInterval,
        repetitionNumber: form.repetitionNumber,
        userIds: this.selectedUsers().map((u) => u.id),
        roomId: typeof form.room === 'string' ? form.room : form.room.id,
        workspaceId: typeof workspace === 'string' ? workspace : workspace.id,
        eventCategoryId:
          typeof form.eventCategory === 'string'
            ? form.eventCategory
            : form.eventCategory.id,
        tagIds: this.selectedTags().map((t) => t.id),
        participantIds: this.selectedParticipants().map((p) => p.id),
      };
      console.log(req);
      const sub = this.eventId
        ? this.eventService.updateEvent(this.eventId, req)
        : this.eventService.createEvent(req);
      sub.subscribe((event) => {
        if (event) {
          this.closeDialog(event);
        }
        this.isSubmitting.set(false);
      });
    }
  }

  public delete() {}

  public cancel() {
    if (this.eventId) {
      // TODO : PATCH FORM VALUES
      this.toggleEditMode();
      this.togglePlanner();
    } else {
      this.closeDialog();
    }
  }

  public displayFn(room?: { name: string }): string {
    return room ? room.name : '';
  }

  previous() {
    this.calendarApi()?.prev();
  }

  next() {
    this.calendarApi()?.next();
  }

  handleDatesSet(args: DatesSetArg) {
    this.dateTitle.set(args.view.title);
    this.selectedRange.set({
      start: args.view.currentStart,
      end: args.view.currentEnd,
    });
  }
}
