import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCalendar, MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
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
  ViewApi,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayjs from 'dayjs';
import { LayoutService } from '../../../../core/layout/layout/layout.service';
import { Event } from '../../../event/models/event';
import { ViewMode } from '../../models/calendar';
import { FullCalendarEventDialogComponent } from '../full-calendar-event-dialog/full-calendar-event-dialog.component';
import { FullCalendarHeaderComponent } from '../full-calendar-header/full-calendar-header.component';

@Component({
  selector: 'app-calendar',
  imports: [
    FullCalendarModule,
    MatSidenavModule,
    MatButtonModule,
    MatDatepickerModule,
    FullCalendarHeaderComponent,
    MatExpansionModule,
    MatIcon,
    // FullCalendarSidebarComponent
  ],
  templateUrl: './full-calendar.component.html',
  styleUrl: './full-calendar.component.scss',
})
export class FullCalendarComponent implements OnInit {
  private readonly layoutService = inject(LayoutService);
  private readonly matDialog = inject(MatDialog);

  private readonly fullCalendar = viewChild.required(FullCalendar);
  private readonly sidebar = viewChild.required(MatSidenav);
  private readonly matCalendar = viewChild.required(MatCalendar<Date>);

  public isSideBarOpen = signal(false);
  public selectedDate = signal(new Date());
  public calendarApi = computed(() => this.fullCalendar().getApi());
  public dateTitle = signal('');
  public viewMode = signal<ViewMode>('timeGridWeek');
  public showOver = computed(() => this.layoutService.windowWidth() < 1024);
  public sidenavMode = computed(() => (this.showOver() ? 'over' : 'push'));
  public currentEvents = signal<EventApi[]>([]);
  public todayDisable = signal(true);

  public calendarOptions = signal<CalendarOptions>({
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin],
    headerToolbar: false,
    initialView: this.viewMode(),
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    allDaySlot: false,
    // locale: "fr",
    // titleFormat: "",
    slotDuration: '00:05:00',
    firstDay: 1,
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
    windowResize: this.autoResize.bind(this),
    expandRows: true,
    scrollTime: this.getCurrentDateInput(),
    height: '100%',
    datesSet: this.onDatesSet.bind(this),
    initialDate: this.selectedDate(),
    showNonCurrentDates: false,
  });

  public ngOnInit(): void {
    this.sidebar().openedChange.subscribe((x) => this.isSideBarOpen.set(x));
  }

  selectedChange(selectedDate: Date) {
    console.log('SELECTED CHANGE');
    this.calendarApi().gotoDate(selectedDate);
  }

  onDatesSet(args: DatesSetArg) {
    /** Set date title */
    this.dateTitle.set(args.view.title);
    /** Set today disable or not */
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.todayDisable.set(
      today >= args.view.currentStart && today < args.view.currentEnd
    );
    /** Update the current month view if we change month */
    this.matCalendar().activeDate = this.selectedDate();
    this.matCalendar().updateTodaysDate();
  }

  getCurrentDateInput() {
    const date = new Date();
    return {
      hour: date.getHours(),
      minute: date.getMinutes(),
    };
  }

  handleWeekendsToggle() {
    this.calendarOptions.update((options) => ({
      ...options,
      weekends: !options.weekends,
    }));
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    this.matDialog
      .open(FullCalendarEventDialogComponent, {
        data: { startDate: selectInfo.start, endDate: selectInfo.end },
      })
      .afterClosed()
      .subscribe((x: Event) => {
        if (x) {
          this.calendarApi().addEvent(x);
        }
      });
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // clear date selection // TODO voir a quoi sa sert
  }

  handleEventClick(clickInfo: EventClickArg) {
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

  viewModeChange(mode: ViewMode) {
    this.calendarApi().changeView(mode);
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

  setDate(date: Date) {
    console.log('SET DATE');
    this.selectedDate.set(date);
    this.calendarApi().gotoDate(date);
  }

  toggleSidebar() {
    this.isSideBarOpen.set(!this.isSideBarOpen());
  }
}
