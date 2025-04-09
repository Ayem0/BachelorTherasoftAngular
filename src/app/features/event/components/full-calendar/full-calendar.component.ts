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
  EventInput,
  EventSourceFuncArg,
  ViewApi,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayjs from 'dayjs';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { LayoutService } from '../../../../core/layout/layout/layout.service';
import { ViewMode } from '../../../event/models/view-mode';
// import { EventStore } from '../../../event/services/event.store';
// import { FullCalendarEventDialogComponent2 } from '../full-calendar-event-dialog2/full-calendar-event-dialog.component';
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
  // private readonly eventStore = inject(EventStore);
  private readonly matDialog = inject(MatDialog);
  private readonly authService = inject(AuthService);

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
  });

  private fetch(
    arg: EventSourceFuncArg,
    successCallback: (eventInputs: EventInput[]) => void,
    failureCallback: (error: Error) => void
  ) {
    // this.eventStore
    //   .getEventsByUserId(
    //     this.authService.currentUserInfo()!.id,
    //     arg.start,
    //     arg.end
    //   )
    //   .subscribe({
    //     next: (events) => {
    //       const fullCalendarEvents = events.map((event) => ({
    //         id: event.id,
    //         start: event.startDate,
    //         end: event.endDate,
    //       }));
    //       successCallback(fullCalendarEvents);
    //     },
    //     error: (error) => {
    //       console.error('Failed to fetch events:', error);
    //       failureCallback(error);
    //     },
    //   });
  }

  public ngOnInit(): void {
    this.sidebar().openedChange.subscribe((x) => this.isSideBarOpen.set(x));
  }

  selectedChange(selectedDate: Date) {
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
    /** update  */
    // this.eventStore;
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

  private handleDateSelect(selectInfo: DateSelectArg) {
    this.calendarApi().unselect(); // clear date selectionÒ
    // this.matDialog
    //   .open(FullCalendarEventDialogComponent2, {
    //     // hasBackdrop: false,
    //     data: { start: selectInfo.start, end: selectInfo.end },
    //     width: '100%',
    //   })
    //   .afterClosed()
    //   .subscribe((x: Event) => {
    //     if (x) {
    //       this.calendarApi().addEvent({
    //         id: x.id,
    //         start: x.startDate,
    //         end: x.endDate,
    //         interactive: false,
    //       });
    //     }
    //   });
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
    this.selectedDate.set(date);
    this.calendarApi().gotoDate(date);
  }

  toggleSidebar() {
    this.isSideBarOpen.set(!this.isSideBarOpen());
  }
}
