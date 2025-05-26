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
import { MatButtonModule } from '@angular/material/button';
import { MatCalendar, MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import {
  FullCalendarComponent as FullCalendar,
  FullCalendarModule,
} from '@fullcalendar/angular';
import {
  CalendarOptions,
  DateSelectArg,
  DatesSetArg,
  EventApi,
  EventClickArg,
  EventInput,
  EventSourceFuncArg,
  ViewApi,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayjs from 'dayjs';
import { LayoutService } from '../../../../core/layout/layout/layout.service';
import { ViewMode } from '../../../event/models/view-mode';
// import { EventStore } from '../../../event/services/event.store';
// import { FullCalendarEventDialogComponent2 } from '../full-calendar-event-dialog2/full-calendar-event-dialog.component';
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { format } from '../../../../shared/utils/date.utils';

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
export class FullCalendarComponent implements OnInit {
  private readonly layoutService = inject(LayoutService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fullCalendar = viewChild.required(FullCalendar);
  private readonly sidebar = viewChild.required(MatSidenav);
  private readonly matCalendar = viewChild.required(MatCalendar<Date>);
  private readonly viewModeSelect = viewChild.required(MatSelect);

  public isSideBarOpen = signal(false);
  public selectedDate = signal(
    this.paramToDate(this.route.snapshot.queryParamMap.get('start')) ||
      new Date()
  );
  public calendarApi = computed(() => this.fullCalendar().getApi());
  public dateTitle = signal('');
  public viewMode = signal<ViewMode>('timeGridWeek');
  public showOver = computed(() => this.layoutService.windowWidth() < 1024);
  public sidenavMode = computed(() => (this.showOver() ? 'over' : 'push'));
  public currentEvents = signal<EventApi[]>([]);
  public todayDisable = signal(true);
  private selectedRange = signal({
    start: new Date(),
    end: new Date(),
  });
  public showWeekend = signal(true);
  public calendarOptions: Signal<CalendarOptions> = computed(() => ({
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin],
    headerToolbar: false,
    initialView: this.viewMode(), // initial view mode
    weekends: true, // show hide weekends
    editable: true, // can move events
    selectable: true, // can
    selectMirror: true, // show event getting created
    dayMaxEvents: true,
    allDaySlot: false, // top space for all day slot
    // locale: "fr",
    slotDuration: '00:05:00',
    firstDay: 0, // first day print 0 = sunday
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
    initialDate: this.selectedDate(),
    showNonCurrentDates: false,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    events: this.fetch.bind(this),
    windowResize: this.autoResize.bind(this),
    datesSet: this.onDatesSet.bind(this),
  }));

  private fetch(
    arg: EventSourceFuncArg,
    successCallback: (eventInputs: EventInput[]) => void,
    failureCallback: (error: Error) => void
  ) {}

  public ngOnInit(): void {
    this.sidebar().openedChange.subscribe((x) => this.isSideBarOpen.set(x));
    this.viewModeSelect().selectionChange.subscribe((x) => {
      this.calendarApi().changeView(x.value);
    });
  }

  private paramToDate(param?: string | null): Date | null {
    if (!param) {
      return null;
    }
    try {
      const [day, month, year] = param.split('/').map(Number);
      return new Date(year, month - 1, day);
    } catch (error) {
      return null;
    }
  }

  selectedChange(selectedDate: Date) {
    this.calendarApi().gotoDate(selectedDate);
  }

  onDatesSet(args: DatesSetArg) {
    // set date title
    this.dateTitle.set(args.view.title);
    // set today disable or not
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.todayDisable.set(
      today >= args.view.currentStart && today < args.view.currentEnd
    );
    // update the current month view if we change month for small calendar
    this.matCalendar().activeDate = this.selectedDate();
    this.matCalendar().updateTodaysDate();
    // update query params
    this.router.navigate(['/agenda'], {
      queryParams: {
        start: format(args.view.currentStart, 'DD/MM/YYYY'),
        end: format(args.view.currentEnd, 'DD/MM/YYYY'),
      },
      queryParamsHandling: 'merge',
    });
    // update selected range
    this.selectedRange.set({
      start: args.view.currentStart,
      end: args.view.currentEnd,
    });
  }

  getCurrentDateInput() {
    const date = new Date();
    return {
      hour: date.getHours(),
      minute: date.getMinutes(),
    };
  }

  toggleShowWeekend() {
    this.showWeekend.set(!this.showWeekend());
  }

  private handleDateSelect(selectInfo: DateSelectArg) {
    this.calendarApi().unselect(); // clear date selection
    // TODO open dialog
  }

  private handleEventClick(clickInfo: EventClickArg) {
    if (
      confirm(
        `Are you sure you want to delete the event '${clickInfo.event.title}'`
      )
    ) {
      clickInfo.event.remove();
    }
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents.set(events);
  }

  previous() {
    const viewMode = this.calendarApi().view.type as ViewMode;
    switch (viewMode) {
      case 'timeGridDay':
        this.selectedDate.set(
          dayjs(this.selectedDate()).subtract(1, 'day').toDate()
        );
        break;
      case 'timeGridWeek':
        this.selectedDate.set(
          dayjs(this.selectedDate()).subtract(1, 'week').toDate()
        );
        break;
      case 'dayGridMonth':
        this.selectedDate.set(
          dayjs(this.selectedDate()).subtract(1, 'month').toDate()
        );
        break;
    }
    this.calendarApi().prev();
  }

  next() {
    const viewMode = this.calendarApi().view.type as ViewMode;
    switch (viewMode) {
      case 'timeGridDay':
        this.selectedDate.set(
          dayjs(this.selectedDate()).add(1, 'day').toDate()
        );
        break;
      case 'timeGridWeek':
        this.selectedDate.set(
          dayjs(this.selectedDate()).add(1, 'week').toDate()
        );
        break;
      case 'dayGridMonth':
        this.selectedDate.set(dayjs(this.selectedDate()).add(1, 'M').toDate());
        break;
    }
    this.calendarApi().next();
  }

  autoResize(arg: { view: ViewApi }) {
    setTimeout(() => this.calendarApi().updateSize(), 300);
  }

  setToday() {
    this.selectedDate.set(new Date());
    this.calendarApi().today();
  }

  toggleSidebar() {
    this.isSideBarOpen.set(!this.isSideBarOpen());
  }
}
