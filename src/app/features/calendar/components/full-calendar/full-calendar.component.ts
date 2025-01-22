import { AfterViewInit, Component, computed, inject, model, OnInit, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIcon } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { FullCalendarComponent as FullCalendar, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg, ViewApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { SonnerService } from '../../../../shared/services/sonner/sonner.service';
import { CalendarService } from '../../services/calendar.service';
import { LayoutService } from '../../../../core/layout/layout/layout.service';
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
export class FullCalendarComponent implements AfterViewInit, OnInit {
  private readonly sonner = inject(SonnerService);
  private readonly calendarService = inject(CalendarService);
  private readonly layoutService = inject(LayoutService);



  private calendar = viewChild.required(FullCalendar);
  private sidebar = viewChild.required(MatSidenav);


  public isSideBarOpen = signal(false);
  public selectedDate = signal(new Date())

  // TODO a connecter avec le reste 
  // ezez
  public calendarApi = computed(() => this.calendar().getApi())

  public showOver = computed(() => this.layoutService.windowWidth() < 1280);
  public sidenavMode = computed(() => this.showOver() ? 'over' : 'push');

  
  calendarOptions = signal<CalendarOptions>({
    customButtons: {
      customPrev: {
        icon: ' material-icons',
        hint: "arrow_back_ios_new",
        themeIcon: "material-icons",
        click: () => this.previous()
      },
      customNext: {
        icon: 'arrow_back_ios_new',
        click: () => this.next()
      }
    },
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      timeGridPlugin,
    ],
    headerToolbar: false,
    initialView: 'timeGridWeek',
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
    height: "100%"

    // dayHeaderFormat: {
    //   weekday: 'short',
    //   day: "2-digit"
    // }
    /* you can update a remote database when these fire:
    eventAdd:
    eventChange:
    eventRemove:
    */
  });
  currentEvents = signal<EventApi[]>([]);

  getCurrentDateInput() {
    const date = new Date();
    return {
      hour: date.getHours(),
      minute: date.getMinutes()
    };
  }

  public ngOnInit(): void {
    this.sidebar().openedChange.subscribe(x => this.isSideBarOpen.set(x))
  }

  ngAfterViewInit(): void {
    this.calendarService.setCalendar(this.calendar());
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

  previous() {
    let api = this.calendar().getApi();
    api?.prev();
  }

  next() {
    let api = this.calendar().getApi();
    api?.next();
  }

  autoResize(arg: { view: ViewApi}) {
    let api = this.calendar().getApi();
    setTimeout(() => api?.updateSize(), 300);
  }
}
