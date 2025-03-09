import {
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
import { CalendarOptions } from '@fullcalendar/core/index.js';
import dayGridPlugin from '@fullcalendar/daygrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import dayjs from 'dayjs';
import { catchError, debounceTime, distinctUntilChanged, of, tap } from 'rxjs';
import { RepetitionComponent } from '../../../../shared/components/repetition/repetition.component';
import { Repetition } from '../../../../shared/models/repetition';
import { isFutureDate } from '../../../../shared/utils/validators.utils';
import { EventCategoryStore } from '../../../event-category/event-category.store';
import { Event, EventRequestForm } from '../../../event/models/event';
import { EventStore } from '../../../event/services/event.store';
import { MemberStore } from '../../../member/member.store';
import { RoomStore } from '../../../room/room.store';
import { WorkspaceStore } from '../../../workspace/workspace.store';
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
  private readonly eventStore = inject(EventStore);
  private readonly eventCategoryStore = inject(EventCategoryStore);
  private readonly roomStore = inject(RoomStore);
  private readonly workspaceStore = inject(WorkspaceStore);
  private readonly memberStore = inject(MemberStore);
  private readonly matDialogData: {
    event: Event | null;
    start: Date | null;
    end: Date | null;
  } = inject(MAT_DIALOG_DATA);

  public event = signal(this.matDialogData.event);
  public disabled = computed(
    () => this.eventStore.creating() || this.eventStore.updating()
  );
  public isUpdate = computed(() => !!this.event());
  public form = new FormGroup<EventRequestForm>(
    {
      description: new FormControl(
        {
          value: this.event()?.description,
          disabled: this.disabled(),
        },
        { nonNullable: true }
      ),
      startDate: new FormControl(
        {
          value:
            this.event()?.startDate || this.matDialogData.start || new Date(),
          disabled: this.disabled(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      endDate: new FormControl(
        {
          value: this.event()?.endDate || this.matDialogData.end || new Date(),
          disabled: this.disabled(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      eventCategoryId: new FormControl(
        {
          value: this.event()?.eventCategoryId || '',
          disabled: this.disabled(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      workspaceId: new FormControl(
        {
          value: this.event()?.workspaceId || '',
          disabled: this.disabled(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      roomId: new FormControl(
        {
          value: this.event()?.roomId ?? '',
          disabled: this.disabled(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      tagIds: new FormControl(
        {
          value: this.event()?.tagIds ?? [],
          disabled: this.disabled(),
        },
        { nonNullable: true }
      ),
      participantIds: new FormControl(
        {
          value: this.event()?.participantIds ?? [],
          disabled: this.disabled(),
        },
        { nonNullable: true }
      ),
      userIds: new FormControl(
        {
          value: this.event()?.userIds ?? [],
          disabled: this.disabled(),
        },
        { nonNullable: true }
      ),
      repetitionInterval: new FormControl(
        {
          value: this.event()?.repetitionInterval,
          disabled: this.disabled(),
        },
        { nonNullable: true }
      ),
      repetitionNumber: new FormControl(
        {
          value: this.event()?.repetitionNumber,
          disabled: this.disabled(),
        },
        { nonNullable: true }
      ),
      repetitionEndDate: new FormControl(
        {
          value: this.event()?.repetitionEndDate,
          disabled: this.disabled(),
        },
        { nonNullable: true }
      ),
    },
    { validators: [isFutureDate] }
  );
  public eventCategories =
    this.eventCategoryStore.eventCategoriesBySelectedWorkspace;
  public workspaces = this.workspaceStore.workspaces;
  public members = this.memberStore.membersBySelectedWorkspaceId;
  public rooms = this.roomStore.roomsBySelectedWorkspaceId;
  public selectedUserIds = signal<string[]>([]);
  public selectedMembers = computed(() =>
    this.members()
      .filter((m) => this.selectedUserIds().includes(m.id))
      .map((m) => ({ id: m.id, title: `${m.firstName} ${m.lastName}` }))
  );
  public canShowCalendar = computed(() => this.selectedMembers().length > 0);
  public startDate = toSignal(this.form.controls.startDate.valueChanges);
  public endDate = toSignal(this.form.controls.endDate.valueChanges);
  public eventDuration = computed(() => {
    const diff = dayjs(this.endDate()).diff(dayjs(this.startDate()), 'days');
    console.log(diff);
    return diff > 0 ? diff : 1;
  });

  public calendarOptions: Signal<CalendarOptions> = computed(() => ({
    initialView: 'customRessourceTimeGridDay',
    headerToolbar: false,
    plugins: [resourceTimeGridPlugin, dayGridPlugin],
    resources: this.selectedMembers(),
    views: {
      customRessourceTimeGridDay: {
        type: 'resourceTimeGrid',
        duration: { days: this.eventDuration() },
      },
    },
    schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
  }));

  ngOnInit(): void {
    this.workspaceStore.getWorkspaces();

    this.form.controls.workspaceId.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(100),
        tap((workspaceId) => {
          this.roomStore.setSelectedWorkspaceId(workspaceId);
          this.memberStore.setSelectedWorkspaceId(workspaceId);
          this.eventCategoryStore.setSelectedWorkspaceId(workspaceId);
          this.roomStore.getRoomsByWorkspaceId();
          this.memberStore.getMembersByWorkspaceId();
          this.eventCategoryStore.getEventCategoriesByWorkspaceId();
        })
      )
      .subscribe();

    this.form.controls.userIds.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(100),
        tap((userIds) => {
          this.selectedUserIds.set(userIds);
        })
      )
      .subscribe();
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
      if (this.event()) {
        this.eventStore
          .updateEvent(this.event()!.id, req)
          .pipe(
            tap((res) => {
              this.matDialogRef.close(res);
            }),
            catchError((err) => {
              console.log(err);
              return of();
            })
          )
          .subscribe();
      } else {
        this.eventStore
          .createEvent(req)
          .pipe(
            tap((res) => {
              this.matDialogRef.close(res);
            }),
            catchError((err) => {
              console.log(err);
              return of();
            })
          )
          .subscribe();
      }
    }
  }
}
