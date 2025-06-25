import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCalendar, MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import {
  MatSlideToggleChange,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FullCalendarComponent as FullCalendar,
  FullCalendarModule,
} from '@fullcalendar/angular';
import {
  CalendarOptions,
  DateSelectArg,
  DatesSetArg,
  EventClickArg,
  EventInput,
  EventSourceFuncArg,
  ViewApi,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  default as momentPlugin,
  default as momentTimezonePlugin,
} from '@fullcalendar/moment';
import timeGridPlugin from '@fullcalendar/timegrid';
import { TranslateModule } from '@ngx-translate/core';
import moment, { Moment } from 'moment';
import { debounceTime, forkJoin, skip, Subject, switchMap, tap } from 'rxjs';
import { LayoutService } from '../../../../core/layout/layout/layout.service';
import { DateService } from '../../../../shared/services/date/date.service';
import { LocaleService } from '../../../../shared/services/locale/locale.service';
import { EventCategory } from '../../../event-category/models/event-category';
import { ViewMode } from '../../../event/models/view-mode';
import { Room } from '../../../room/models/room';
import { Tag } from '../../../tag/models/tag';
import { Workspace } from '../../../workspace/models/workspace';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { DateRange, Event } from '../../models/event';
import { AgendaService } from '../../services/agenda.service';
import { EventService } from '../../services/event.service';
import { EventDetailsComponent } from '../event-details/event-details.component';
import { SmallCalendarHeaderComponent } from '../small-calendar-header/small-calendar-header.component';
@Component({
  selector: 'app-calendar',
  imports: [
    FullCalendarModule,
    MatSidenavModule,
    MatButtonModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatIcon,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    TranslateModule,
    MatMenuModule,
    MatSlideToggleModule,
    FormsModule,
    MatListModule,
    MatProgressSpinner,
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        subscriptSizing: 'dynamic',
      },
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './full-calendar.component.html',
  styleUrl: './full-calendar.component.scss',
})
export class FullCalendarComponent implements OnInit, AfterViewInit {
  public customHeader = SmallCalendarHeaderComponent;
  private readonly layoutService = inject(LayoutService);
  private readonly eventService = inject(EventService);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly locale = inject(LocaleService);
  private readonly matDialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly agendaService = inject(AgendaService);
  private readonly date = inject(DateService);
  private readonly fullCalendar = viewChild.required(FullCalendar);
  private readonly matCalendar = viewChild.required(MatCalendar<Moment>);

  public isLoading = signal(false);
  public isLoadingWorkspaces = signal(false);
  public isSideBarOpen = this.agendaService.isSideBarOpen;
  public showWeekend = this.agendaService.showWeekend;
  public localeOffsetName = this.locale.localeOffsetName;
  public dateTitle = signal('');
  public todayDisable = signal(true);
  public calendarApi = computed(() => this.fullCalendar().getApi());
  public showOver = computed(() => this.layoutService.windowWidth() < 1024);
  public sidenavMode = computed(() => (this.showOver() ? 'over' : 'push'));
  public viewMode = signal<ViewMode>(
    this.toViewMode(this.route.snapshot.queryParamMap.get('view'))
  );
  public workspaces = this.workspaceService.workspaces();
  public selectedWorkspaceIds = signal<string[]>([]);
  public selectedDate = signal(
    this.toClosestWeekDay(
      this.paramToDate(this.route.snapshot.queryParamMap.get('s')) || moment()
    )
  );
  public selectedRange = signal<DateRange>({
    start: moment(),
    end: this.date.incrementDate(moment(), 1, 'day'),
  });
  public calendarOptions: CalendarOptions = {
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      timeGridPlugin,
      momentPlugin,
      momentTimezonePlugin,
    ],
    headerToolbar: false,
    initialView: this.viewMode(), // initial view mode
    weekends: this.showWeekend(), // show hide weekends
    editable: true, // can move events
    selectable: true, // can
    selectMirror: true, // show event getting created
    dayMaxEvents: true,
    allDaySlot: false, // top space for all day slot
    initialDate: this.selectedDate().toISOString(),
    timeZone: this.locale.currentTz(),
    locale: this.locale.currentLang(),
    slotDuration: '00:05:00',
    firstDay: this.locale.currentLang() === 'en' ? 0 : 1, // first day 0 = sunday 1 = monday
    slotLabelFormat: [
      {
        hour: '2-digit',
        minute: '2-digit',
        omitZeroMinute: false,
        meridiem: 'lowercase',
      },
    ],
    nowIndicator: true,
    handleWindowResize: true,
    expandRows: true,
    scrollTime: this.getCurrentDateInput(),
    height: '100%',
    showNonCurrentDates: false,
    loading: this.handleLoading.bind(this),
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    events: this.handleFetch.bind(this),
    windowResize: this.autoResize.bind(this),
    datesSet: this.onDatesSet.bind(this),
  };
  private events = this.eventService.agendaEvents(this.selectedRange);
  private filteredEvents = computed(() =>
    this.events().filter((x) =>
      this.selectedWorkspaceIds().includes(x.workspace.id)
    )
  );
  // for debouctime time
  private subject = new Subject<(eventInputs: EventInput[]) => void>();

  public ngOnInit(): void {
    this.setViewModeToParams(this.viewMode());
    this.isLoading.set(true);
    this.isLoadingWorkspaces.set(true);
    const unit =
      this.viewMode() === 'timeGridDay'
        ? 'day'
        : this.viewMode() === 'timeGridWeek'
        ? 'week'
        : 'month';
    forkJoin([
      this.eventService.getAgendaEvents({
        start: this.selectedDate(),
        end: this.date.incrementDate(this.selectedDate(), 1, unit),
      }),
      this.workspaceService.getWorkspaces(),
    ]).subscribe(([events, ws]) => {
      this.selectedWorkspaceIds.set(this.workspaces().map((x) => x.id));
      this.isLoading.set(false);
      this.isLoadingWorkspaces.set(false);
    });

    this.subject
      .pipe(
        debounceTime(200),
        switchMap((fn) =>
          this.eventService
            .getAgendaEvents({
              start: this.selectedRange().start,
              end: this.selectedRange().end,
            })
            .pipe(tap(() => fn(this.toEventInput(this.filteredEvents()))))
        )
      )
      .subscribe();
  }

  public ngAfterViewInit(): void {
    this.locale.currentLang$.pipe(skip(1)).subscribe(() => this.setLocale());
    this.locale.currentTz$.pipe(skip(1)).subscribe(() => this.setTimezone());
    this.agendaService.showWeekendObs.pipe(skip(1)).subscribe((x) => {
      this.calendarApi().setOption('weekends', x);
      this.selectedDate.set(this.toClosestWeekDay(this.selectedDate()));
      this.matCalendar().activeDate = this.selectedDate();
      this.matCalendar().updateTodaysDate();
    });
  }

  public viewModeChange(event: MatSelectChange) {
    this.viewMode.set(event.value);
    this.calendarApi().changeView(event.value);
    this.selectedDate.set(this.toClosestWeekDay(this.selectedDate()));
    this.calendarApi().gotoDate(this.selectedDate().toISOString());
    this.calendarApi().refetchEvents();
    this.setViewModeToParams(this.viewMode());
  }
  public selectedDateChange(selectedDate: Moment | null) {
    if (selectedDate) {
      this.selectedDate.set(selectedDate);
      if (this.viewMode() === 'timeGridDay') {
        this.calendarApi().gotoDate(
          this.date.incrementDate(selectedDate, 1, 'day').toISOString()
        );
      } else {
        this.calendarApi().gotoDate(selectedDate.toDate());
      }
    }
  }

  public selectionChange(event: MatSelectionListChange) {
    this.calendarApi().refetchEvents();
  }
  public showWeekendChange(event: MatSlideToggleChange) {
    this.agendaService.setShowWeekends(event.checked);
  }

  public setToday() {
    this.selectedDate.set(moment());
    this.calendarApi().gotoDate(this.selectedDate().toISOString());
  }

  public weekEndFilter = this.agendaService.weekEndFilter;

  public openDialog(
    eventId?: string,
    start?: Moment | string,
    end?: Moment | string
  ) {
    this.matDialog
      .open(EventDetailsComponent, {
        data: {
          eventId: eventId,
          start: start,
          end: end,
        },
        maxWidth: '100%',
        maxHeight: '100%',
      })
      .afterClosed()
      .subscribe(() => this.calendarApi().refetchEvents());
  }

  public toggleSidebar() {
    this.agendaService.setSideBarOpen(!this.isSideBarOpen());
  }

  public previous() {
    const viewMode = this.calendarApi().view.type as ViewMode;
    let number = 1;
    let unit: 'day' | 'week' | 'month' = 'day';
    if (viewMode === 'timeGridDay') {
      if (!this.showWeekend() && this.selectedDate().day() === 1) number = 3;
    } else if (viewMode === 'timeGridWeek') {
      unit = 'week';
    } else if (viewMode === 'dayGridMonth') {
      unit = 'month';
    }
    this.selectedDate.set(
      this.date.decrementDate(this.selectedDate(), number, unit)
    );
    this.calendarApi().prev();
  }

  public next() {
    const viewMode = this.calendarApi().view.type as ViewMode;
    let number = 1;
    let unit: 'day' | 'week' | 'month' = 'day';
    if (viewMode === 'timeGridDay') {
      if (!this.showWeekend() && this.selectedDate().day() === 5) number = 3;
    } else if (viewMode === 'timeGridWeek') {
      unit = 'week';
    } else if (viewMode === 'dayGridMonth') {
      unit = 'month';
    }
    this.selectedDate.set(
      this.date.incrementDate(this.selectedDate(), number, unit)
    );
    this.calendarApi().next();
  }

  private setLocale() {
    this.calendarApi().setOption('locale', this.locale.currentLang());
    this.calendarApi().setOption(
      'firstDay',
      this.locale.currentLang() === 'fr' ? 1 : 0
    );
  }

  private toViewMode(key: string | null | undefined): ViewMode {
    if (key && (key === 'w' || key === 'm')) {
      return key === 'w' ? 'timeGridWeek' : 'dayGridMonth';
    }
    return 'timeGridDay';
  }

  private setViewModeToParams(viewMode: ViewMode) {
    let viewKey = 'd';
    if (viewMode === 'timeGridWeek') {
      viewKey = 'w';
    } else if (viewMode === 'dayGridMonth') {
      viewKey = 'm';
    }
    this.router.navigate(['/agenda'], {
      queryParams: {
        view: viewKey,
      },
      queryParamsHandling: 'merge',
    });
  }

  private toEventInput(
    events: Event<{
      eventCategory: EventCategory;
      room: Room;
      tags: Tag[];
      workspace: Workspace;
    }>[]
  ): EventInput[] {
    return events.map((event) => ({
      id: event.id,
      title: event.eventCategory.name,
      start: event.startDate
        .tz(this.locale.currentTz())
        .format('YYYY-MM-DDTHH:mm:ssZ'),
      end: event.endDate
        .tz(this.locale.currentTz())
        .format('YYYY-MM-DDTHH:mm:ssZ'),
      color:
        this.viewMode() === 'dayGridMonth'
          ? event.workspace.color
          : event.eventCategory.color,
      backgroundColor: event.workspace.color,
      startEditable: false,
      durationEditable: false,
      classNames:
        this.viewMode() === 'dayGridMonth'
          ? ['!shadow-none', 'border-0']
          : ['!shadow-none', 'border-0', 'border-l-8'],
      extendedProps: {
        event: event,
      },
    }));
  }

  private handleLoading(isLoading: boolean) {
    this.isLoading.set(isLoading);
  }

  private handleFetch(
    arg: EventSourceFuncArg,
    successCallback: (eventInputs: EventInput[]) => void,
    failureCallback: (error: Error) => void
  ) {
    this.subject.next(successCallback);
  }

  private toClosestWeekDay(date: Moment): Moment {
    if (this.showWeekend()) return date;
    if (this.viewMode() === 'timeGridDay') {
      if (date.day() === 0 || date.day() === 6) {
        return this.date.incrementDate(date, date.day() === 0 ? 1 : 2, 'day');
      }
    } else if (this.viewMode() === 'timeGridWeek') {
      if (date.day() === 0 || date.day() === 6) {
        return this.date.incrementDate(date, date.day() === 0 ? 2 : 1, 'day');
      }
    }
    return date;
  }

  private paramToDate(param?: string | null): Moment | null {
    if (!param) return null;
    try {
      const [day, month, year] = param.split('/').map(Number);
      const utcMidnight = moment(new Date(Date.UTC(year, month - 1, day)));
      return utcMidnight;
    } catch (error) {
      return null;
    }
  }

  private onDatesSet(args: DatesSetArg) {
    // set date title
    this.dateTitle.set(args.view.title);
    // set today disable or not
    const today = new Date();
    if (this.showWeekend() === false && today.getDay() === (0 || 6)) {
      this.todayDisable.set(true);
    } else {
      this.todayDisable.set(
        today >= args.view.currentStart && today <= args.view.currentEnd
      );
    }
    this.selectedRange.set({
      start: moment(args.view.currentStart),
      end: moment(args.view.currentEnd),
    });
    // update the current month view if we change month for small calendar
    this.matCalendar().activeDate = moment(this.selectedDate());
    this.matCalendar().updateTodaysDate();
    // update query params
    this.router.navigate(['/agenda'], {
      queryParams: {
        s: this.selectedDate().format('DD/MM/YYYY'),
      },
      queryParamsHandling: 'merge',
    });
  }

  private setTimezone() {
    const newTimezone = this.locale.currentTz();
    this.calendarApi().setOption('timeZone', newTimezone);
    const currentRange = this.selectedRange();
    const newRange = {
      start: currentRange.start.clone().tz(newTimezone),
      end: currentRange.end.clone().tz(newTimezone),
    };
    this.selectedRange.set(newRange);
    this.calendarApi().refetchEvents();
  }

  private getCurrentDateInput() {
    const date = new Date();
    return {
      hour: date.getHours(),
      minute: date.getMinutes(),
    };
  }

  private handleDateSelect(selectInfo: DateSelectArg) {
    this.calendarApi().unselect();
    const start = moment(selectInfo.startStr).utc().tz(this.locale.currentTz());
    const end = moment(selectInfo.endStr).utc().tz(this.locale.currentTz());
    this.openDialog(undefined, start, end);
  }

  private handleEventClick(clickInfo: EventClickArg) {
    this.openDialog(
      clickInfo.event.id,
      clickInfo.event.start ? moment.utc(clickInfo.event.start) : undefined,
      clickInfo.event.end ? moment.utc(clickInfo.event.end) : undefined
    );
  }

  private autoResize(arg: { view: ViewApi }) {
    this.calendarApi().updateSize();
  }
}
