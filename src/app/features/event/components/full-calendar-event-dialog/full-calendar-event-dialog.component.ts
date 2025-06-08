import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
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
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import {
  FullCalendarComponent,
  FullCalendarModule,
} from '@fullcalendar/angular';
import {
  CalendarOptions,
  EventInput,
  EventSourceFuncArg,
} from '@fullcalendar/core/index.js';
import dayGridPlugin from '@fullcalendar/daygrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import {
  ResourceFuncArg,
  ResourceInput,
} from '@fullcalendar/resource/index.js';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, forkJoin, tap } from 'rxjs';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { RepetitionComponent } from '../../../../shared/components/repetition/repetition.component';
import { DateService } from '../../../../shared/services/date/date.service';
import { LocaleService } from '../../../../shared/services/locale/locale.service';
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
    TranslateModule,
    MatIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './full-calendar-event-dialog.component.html',
  styleUrl: './full-calendar-event-dialog.component.scss',
})
export class FullCalendarEventDialogComponent implements OnInit {
  private readonly matDialog = inject(MatDialog);
  private readonly matDialogRef = inject(
    MatDialogRef<FullCalendarEventDialogComponent>
  );
  private readonly matDialogData: {
    start: Date | null;
    end: Date | null;
  } = inject(MAT_DIALOG_DATA);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly eventService = inject(EventService);
  private readonly eventCategoryService = inject(EventCategoryService);
  private readonly tagService = inject(TagService);
  private readonly roomService = inject(RoomService);
  private readonly memberService = inject(MemberService);
  private readonly authService = inject(AuthService);
  private readonly locale = inject(LocaleService);
  private readonly date = inject(DateService);

  public isLoading = signal(false);
  public isLoadingRes = signal(false);
  public isSubmitting = signal(false);

  public form = new FormGroup<EventRequestForm>(
    {
      description: new FormControl(
        {
          value: undefined,
          disabled: this.isSubmitting(),
        },
        { nonNullable: true }
      ),
      startDate: new FormControl(
        {
          value: this.matDialogData.start ?? new Date(),
          disabled: this.isSubmitting(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      endDate: new FormControl(
        {
          value: this.matDialogData.end ?? new Date(),
          disabled: this.isSubmitting(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      eventCategoryId: new FormControl(
        {
          value: '',
          disabled: this.isSubmitting(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      workspaceId: new FormControl(
        {
          value: '',
          disabled: this.isSubmitting(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      roomId: new FormControl(
        {
          value: '',
          disabled: this.isSubmitting(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      tagIds: new FormControl(
        {
          value: [],
          disabled: this.isSubmitting(),
        },
        { nonNullable: true }
      ),
      participantIds: new FormControl(
        {
          value: [],
          disabled: this.isSubmitting(),
        },
        { nonNullable: true }
      ),
      userIds: new FormControl(
        {
          value: [],
          disabled: this.isSubmitting(),
        },
        { nonNullable: true }
      ),
      repetitionInterval: new FormControl(
        {
          value: undefined,
          disabled: this.isSubmitting(),
        },
        { nonNullable: true }
      ),
      repetitionNumber: new FormControl(
        {
          value: undefined,
          disabled: this.isSubmitting(),
        },
        { nonNullable: true }
      ),
      repetitionEndDate: new FormControl(
        {
          value: undefined,
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
  public members = computed(() =>
    this.memberService
      .membersByWorkspaceId(this.workspaceId)()
      .filter((u) => u.id !== this.authService.currentUserInfo()?.id)
  );
  public rooms = this.roomService.roomsByWorkspaceId(this.workspaceId);
  public tags = this.tagService.tagsByWorkspaceId(this.workspaceId);
  public selectedUserIds = signal<string[]>([]);
  public selectedMembers = computed(() =>
    this.members()
      .filter((m) => this.selectedUserIds().includes(m.id))
      .map((m) => ({ id: m.id, title: `${m.firstName} ${m.lastName}` }))
  );
  private readonly fullCalendar = viewChild(FullCalendarComponent);
  public selectedRoomId = signal<string>('');
  public selectedRoom = computed(() => {
    const room = this.rooms().find((r) => r.id === this.selectedRoomId());
    return room ? { id: room.id, title: room.name } : null;
  });
  public resources = computed(() =>
    this.selectedRoom()
      ? [...this.selectedMembers(), this.selectedRoom()!]
      : [...this.selectedMembers()]
  );
  public isPlannerOpen = signal(false);
  public canShowCalendar = computed(
    () => this.resources().length > 0 && this.startDate() < this.endDate()
  );
  public startDate = signal(this.matDialogData.start ?? new Date());
  public endDate = signal(this.matDialogData.end ?? new Date());
  public calendarApi = computed(() => this.fullCalendar()?.getApi());

  public duration = computed(() => 1);

  public calendarOptions: CalendarOptions = {
    initialView: 'resourceTimeGrid',
    duration: {
      days: this.duration(),
    },
    headerToolbar: {
      left: 'title',
      center: undefined,
      right: undefined,
    },
    plugins: [resourceTimeGridPlugin, dayGridPlugin],
    // resources: this.resources(),
    allDaySlot: false,
    height: '100%',
    handleWindowResize: true,
    expandRows: true,
    initialDate: this.startDate(),
    locale: this.locale.currentLang(),
    timeZone: this.locale.currentTz(),
    slotDuration: '00:05:00',
    schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
    events: this.fetch.bind(this),
    resources: this.handleResources.bind(this),
    scrollTime: {
      hour: this.startDate().getHours(),
      minute: this.startDate().getMinutes(),
    },
  };

  public temporaryEvents: Signal<EventInput[]> = computed(() =>
    this.resources().map((r) => ({
      start: this.date.toLocaleString(this.startDate()),
      end: this.date.toLocaleString(this.endDate()),
      title: 'test',
      resourceId: r.id,
    }))
  );

  public togglePlanner() {
    this.isPlannerOpen.update((x) => !x);
    if (this.isPlannerOpen()) {
      this.matDialogRef.updateSize('100%', '100%');
    } else {
      this.matDialogRef.updateSize('', '');
    }
  }

  constructor() {
    this.form.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap((formValue) => {
          if (formValue.startDate) {
            this.startDate.set(formValue.startDate);
            this.calendarApi()?.refetchEvents();
            this.calendarApi()?.setOption('duration', {
              days: this.duration(),
            });
          }
          if (formValue.endDate) {
            this.endDate.set(formValue.endDate);
            this.calendarApi()?.refetchEvents();
            this.calendarApi()?.setOption('duration', {
              days: this.duration(),
            });
          }
          if (formValue.roomId) {
            this.selectedRoomId.set(formValue.roomId);
            this.calendarApi()?.refetchResources();
            this.calendarApi()?.refetchEvents();
          }
          if (formValue.userIds) {
            this.selectedUserIds.set(formValue.userIds);
            this.calendarApi()?.refetchResources();
            this.calendarApi()?.refetchEvents();
          }
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
    this.workspaceService
      .getWorkspaces()
      .subscribe(() => this.isLoading.set(false));
  }

  public close() {
    this.matDialogRef.close();
  }

  public openRepetitionDialog() {
    this.matDialog.open(RepetitionComponent);
  }

  public submit() {
    if (this.form.valid) {
      const req = this.form.getRawValue();
      console.log(req);
      this.eventService.createEvent({ ...req, tagIds: [] }).subscribe((res) => {
        // TODO a changer par is assign to me si oui return true pour dire de refetch
        if (res) {
          this.matDialogRef.close(res);
        }
      });
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
}
