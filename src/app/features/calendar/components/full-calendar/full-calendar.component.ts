import { AfterViewInit, Component , inject, signal, ViewChild } from '@angular/core';
import { CalendarOptions, DateSelectArg, EventClickArg, EventApi, ViewApi, DurationInput } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { FullCalendarComponent as FullCalendar, FullCalendarModule } from '@fullcalendar/angular';
import { SonnerService } from '../../../../shared/services/sonner/sonner.service';
import { CalendarService } from '../../services/calendar.service';

@Component({
    selector: 'app-calendar',
    imports: [
        FullCalendarModule
    ],
    templateUrl: './full-calendar.component.html',
    styleUrl: './full-calendar.component.scss'
})
export class FullCalendarComponent implements AfterViewInit {
  private readonly sonner = inject(SonnerService);
  private readonly calendarService = inject(CalendarService);
  
  @ViewChild('calendar') calendarComponent: FullCalendar | null= null;

  calendarVisible = signal(true);
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
    headerToolbar: {
      left: 'title',
      right: 'today customPrev,customNext timeGridDay,timeGridWeek,dayGridMonth'
    },
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

  ngAfterViewInit(): void {
    if(this.calendarComponent) {
      this.calendarService.setCalendar(this.calendarComponent);
    }
  }

  handleCalendarToggle() {
    this.calendarVisible.update((bool) => !bool);
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
    let api = this.calendarComponent?.getApi();
    api?.prev();
  }

  next() {
    let api = this.calendarComponent?.getApi();
    api?.next();
  }

  autoResize(arg: { view: ViewApi}) {
    let api = this.calendarComponent?.getApi();
    setTimeout(() => api?.updateSize(), 300);
  }
}
