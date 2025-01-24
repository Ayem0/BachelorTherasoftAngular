import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { DateRange, DefaultMatCalendarRangeStrategy, MAT_DATE_RANGE_SELECTION_STRATEGY, MatDatepickerModule, MatRangeDateSelectionModel } from '@angular/material/datepicker';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { FullCalendarComponent as FullCalendar, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DateRangeInput, DateSelectArg, DatesSetArg, EventApi, EventClickArg, ViewApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayjs from 'dayjs';
import { LayoutService } from '../../../../core/layout/layout/layout.service';
import { ViewMode } from '../../models/calendar';
import { FullCalendarHeaderComponent } from "../full-calendar-header/full-calendar-header.component";

@Component({
    selector: 'app-calendar',
    imports: [
      FullCalendarModule,
      MatSidenavModule,
      MatButtonModule,
      MatDatepickerModule,
      FullCalendarHeaderComponent,
      // FullCalendarSidebarComponent
    ],
    providers: [
            {
              provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
              useClass: DefaultMatCalendarRangeStrategy
            },
            DefaultMatCalendarRangeStrategy,
            MatRangeDateSelectionModel
        ],
    templateUrl: './full-calendar.component.html',
    styleUrl: './full-calendar.component.scss'
})
export class FullCalendarComponent implements OnInit {
  private readonly layoutService = inject(LayoutService);
  private readonly selectionStrategy = inject(DefaultMatCalendarRangeStrategy<Date>);
  private readonly selectionModel = inject(MatRangeDateSelectionModel<Date>);

  private calendar = viewChild.required(FullCalendar);
  private sidebar = viewChild.required(MatSidenav);
  
  public isSideBarOpen = signal(false);
  public selectedDate = signal(new DateRange<Date>(new Date(), new Date()))
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
    initialView: this.viewMode(), // TODO A CHANGER PAR UN TRUC TYPER CLEAN REGARDER CALENDAR.TS
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
    initialDate: this.selectedDate().start ?? undefined 
  });

  public ngOnInit(): void {
    this.sidebar().openedChange.subscribe(x => this.isSideBarOpen.set(x));
  }

  selectedChange(selectedDate: Date) {
    const selection = this.selectionModel.selection, newSelection = this.selectionStrategy.selectionFinished(
        selectedDate,
        selection
    );
    console.log(selection)
    this.selectionModel.updateSelection(newSelection, this);

    this.selectedDate.set(new DateRange<Date>(newSelection.start, newSelection.end));
    if (this.selectionModel.isComplete()) {
      this.calendarApi().gotoDate(newSelection.start)
    }
}

  rangeChanged(selectedDate: Date) {
    const selection = this.selectionModel.selection,
      newSelection = this.selectionStrategy.selectionFinished(
        selectedDate,
        selection
      );

    this.selectionModel.updateSelection(newSelection, this);
    this.selectedDate.set(new DateRange<Date>(
      newSelection.start,
      newSelection.end
    ));
  }


  onDatesSet(args: DatesSetArg) {
    this.dateTitle.set(args.view.title);
    const endDate = dayjs(args.end).subtract(1, 'minute').toDate()
    this.selectedDate.set(new DateRange(args.start, endDate))
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

  setDate(date: DateRange<Date> ){
    const rangeInput : DateRangeInput =  {
      start: date.start ?? undefined,
      end: date.end ?? undefined
    }
    this.selectedDate.set(date)
    this.calendarApi().changeView(this.calendarApi().view.type, rangeInput)
    this.calendarApi().gotoDate(date.start!)
  } 
}
