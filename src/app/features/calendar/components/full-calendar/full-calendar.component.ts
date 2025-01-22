import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { DateRange, MatDatepickerModule } from '@angular/material/datepicker';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { FullCalendarComponent as FullCalendar, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, DatesSetArg, EventApi, EventClickArg, ViewApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { LayoutService } from '../../../../core/layout/layout/layout.service';
import { ViewMode } from '../../models/calendar';
import { FullCalendarHeaderComponent } from "../full-calendar-header/full-calendar-header.component";
import { FullCalendarSidebarComponent } from '../full-calendar-sidebar/full-calendar-sidebar.component';

@Component({
    selector: 'app-calendar',
    imports: [
    FullCalendarModule,
    MatSidenavModule,
    MatButtonModule,
    MatDatepickerModule,
    FullCalendarHeaderComponent,
    FullCalendarSidebarComponent
],
    templateUrl: './full-calendar.component.html',
    styleUrl: './full-calendar.component.scss'
})
export class FullCalendarComponent implements OnInit {
  private readonly layoutService = inject(LayoutService);
  
  private calendar = viewChild.required(FullCalendar);
  private sidebar = viewChild.required(MatSidenav);
  test = 0;
  
  public isSideBarOpen = signal(false);
  public selectedDate = signal(new DateRange(new Date("2020-2-1"), new Date("2020-1-1")))
  public calendarApi = computed(() => this.calendar().getApi());
  public dateTitle = signal("");
  public viewMode = signal<ViewMode>('timeGridWeek');
  public showOver = computed(() => this.layoutService.windowWidth() < 1024);
  public sidenavMode = computed(() => this.showOver() ? 'over' : 'push');
  public currentEvents = signal<EventApi[]>([]);
  public todayDisable = signal(true);

  public calendarOptions = signal<CalendarOptions>({
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      timeGridPlugin,
    ],
    headerToolbar: false,
    initialView: 'timeGridWeek', // TODO A CHANGER PAR UN TRUC TYPER CLEAN REGARDER CALENDAR.TS
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    allDaySlot: false,
    locale: "fr",
    // titleFormat: "",
    slotDuration: "00:05:00",
    firstDay: 1,
    slotLabelFormat: [
      {
        hour: '2-digit',
        minute: '2-digit',
        omitZeroMinute: false,
        meridiem: 'lowercase'
      }
    ],
    nowIndicator: true,
    handleWindowResize: true,
    windowResize: this.autoResize.bind(this),
    expandRows: true,
    scrollTime: this.getCurrentDateInput(),
    height: "100%",
    datesSet: this.onDatesSet.bind(this),
  });

  public ngOnInit(): void {
    this.sidebar().openedChange.subscribe(x => this.isSideBarOpen.set(x));
  }

  onDatesSet(args: DatesSetArg) {
    this.dateTitle.set(args.view.title);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.todayDisable.set(today >= args.view.currentStart && today < args.view.currentEnd);
  }

  getCurrentDateInput() {
    const date = new Date();
    return {
      hour: date.getHours(),
      minute: date.getMinutes()
    };
  }

  handleWeekendsToggle() {
    this.calendarOptions.update((options) => ({
      ...options,
      weekends: !options.weekends,
    }));
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    const title = prompt('Please enter a new title for your event');
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection
    
    if (title) {
      calendarApi.addEvent({
        id: "1",
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      });
    }
  }

  handleEventClick(clickInfo: EventClickArg) {
    if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
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
    this.calendarApi().prev();
  }

  next() {
    this.calendarApi().next();
  }

  autoResize(arg: { view: ViewApi}) {
    setTimeout(() => this.calendarApi().updateSize(), 300);
  }

  setToday() {
    this.calendarApi().today();
  }

  setDate(date: DateRange<Date>){
    if (date.end && date.start) {
      console.log("ici")
      this.calendarApi().formatRange(date.start, date.end, {})
    }
  } 
}
