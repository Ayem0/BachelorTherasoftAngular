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
import { MatListModule, MatSelectionList } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import {
  MatSlideToggle,
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
  EventApi,
  EventClickArg,
  EventInput,
  EventSourceFuncArg,
  ViewApi,
} from '@fullcalendar/core';
import { DateRange } from '@fullcalendar/core/internal';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, forkJoin, Subject, switchMap, tap } from 'rxjs';
import { LayoutService } from '../../../../core/layout/layout/layout.service';
import { TranslateService } from '../../../../shared/services/translate/translate.service';
import {
  decrementDate,
  format,
  incrementDate,
} from '../../../../shared/utils/date.utils';
import { EventCategory } from '../../../event-category/models/event-category';
import { ViewMode } from '../../../event/models/view-mode';
import { Room } from '../../../room/models/room';
import { Tag } from '../../../tag/models/tag';
import { Workspace } from '../../../workspace/models/workspace';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { Event } from '../../models/event';
import { EventService } from '../../services/event.service';
import { FullCalendarEventDialogComponent } from '../full-calendar-event-dialog/full-calendar-event-dialog.component';
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
  private readonly translate = inject(TranslateService);
  private readonly matDialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly fullCalendar = viewChild.required(FullCalendar);
  private readonly sidebar = viewChild.required(MatSidenav);
  private readonly viewModeSelect = viewChild.required(MatSelect);
  private readonly weekendToggle = viewChild.required(MatSlideToggle);
  private readonly matCalendar = viewChild.required(MatCalendar<Date>);
  private readonly matList = viewChild.required(MatSelectionList);

  public isLoading = signal(false);

  public isLoadingWorkspaces = signal(false);
  public workspaces = this.workspaceService.workspaces();
  public selectedWorkspaceIds = signal<string[]>([]);

  public isSideBarOpen = signal(false);

  public selectedDate = signal(
    this.paramToDate(this.route.snapshot.queryParamMap.get('start')) ||
      new Date()
  );
  public selectedRange = signal<DateRange>({
    start:
      this.paramToDate(this.route.snapshot.queryParamMap.get('start')) ||
      new Date(),
    end:
      this.paramToDate(this.route.snapshot.queryParamMap.get('end')) ||
      incrementDate(new Date(), 1, 'day'),
  });

  private events = this.eventService.agendaEvents(this.selectedRange);
  private filteredEvents = computed(() =>
    this.toEventInput(
      this.events().filter((x) =>
        this.selectedWorkspaceIds().includes(x.workspace.id)
      )
    )
  );

  public calendarApi = computed(() => this.fullCalendar().getApi());
  public dateTitle = signal('');
  public viewMode = signal<ViewMode>('timeGridWeek');
  public showOver = computed(() => this.layoutService.windowWidth() < 1024);
  public sidenavMode = computed(() => (this.showOver() ? 'over' : 'push'));
  public todayDisable = signal(true);
  public showWeekend = signal(false);
  public calendarOptions: CalendarOptions = {
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin],
    headerToolbar: false,
    initialView: this.viewMode(), // initial view mode
    weekends: this.showWeekend(), // show hide weekends
    editable: true, // can move events
    selectable: true, // can
    selectMirror: true, // show event getting created
    dayMaxEvents: true,
    allDaySlot: false, // top space for all day slot
    locale: this.translate.currentLang(),
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
    loading: this.handleLoading.bind(this),
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    events: this.fetch.bind(this),
    windowResize: this.autoResize.bind(this),
    datesSet: this.onDatesSet.bind(this),
  };

  // for debouctime time
  private subject = new Subject<(eventInputs: EventInput[]) => void>();

  private setLocale() {
    this.calendarApi().setOption('locale', this.translate.currentLang());
    this.calendarApi().setOption(
      'firstDay',
      this.translate.currentLang() === 'fr' ? 1 : 0
    );
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
      title: event.description,
      start: event.startDate,
      end: event.endDate,
      extendedProps: {
        event: event,
      },
    }));
  }

  private handleLoading(isLoading: boolean) {
    this.isLoading.set(isLoading);
  }

  private fetch(
    arg: EventSourceFuncArg,
    successCallback: (eventInputs: EventInput[]) => void,
    failureCallback: (error: Error) => void
  ) {
    this.subject.next(successCallback);
  }

  public ngOnInit(): void {
    this.isLoading.set(true);
    this.isLoadingWorkspaces.set(true);
    forkJoin([
      this.eventService.getAgendaEvents({
        start: this.selectedRange().start,
        end: this.selectedRange().end,
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
            .pipe(tap(() => fn(this.filteredEvents())))
        )
      )
      .subscribe();

    this.sidebar().openedChange.subscribe((x) => this.isSideBarOpen.set(x));
    // TODO Les 3 subscribe en dessous sont a remplacer par des fonctions
    this.viewModeSelect().selectionChange.subscribe((x) => {
      this.viewMode.set(x.value);
      this.calendarApi().changeView(x.value);
      this.selectedDate.set(this.toClosestWeekDay(this.selectedDate()));
      this.calendarApi().gotoDate(this.selectedDate());
    });

    this.weekendToggle().change.subscribe((x) => {
      this.calendarApi().setOption('weekends', x.checked);
      this.selectedDate.set(this.toClosestWeekDay(this.selectedDate()));
    });

    this.matList().selectionChange.subscribe(() => {
      this.calendarApi().refetchEvents();
    });
  }

  private toClosestWeekDay(date: Date): Date {
    if (this.viewMode() === 'timeGridDay') {
      if (date.getDay() === 0 || date.getDay() === 6) {
        return incrementDate(
          new Date(date),
          date.getDay() === 0 ? 1 : 2,
          'day'
        );
      }
    } else if (this.viewMode() === 'timeGridWeek') {
      if (date.getDay() === 0 || date.getDay() === 6) {
        return decrementDate(
          new Date(date),
          date.getDay() === 0 ? 2 : 1,
          'day'
        );
      }
    }
    return date;
  }

  public ngAfterViewInit(): void {
    this.translate.currentLang$.subscribe(() => this.setLocale());
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

  selectedChange(selectedDate: Date | null) {
    if (selectedDate) {
      this.calendarApi().gotoDate(selectedDate);
    }
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
    this.selectedRange.set({
      start: args.view.currentStart,
      end: args.view.currentEnd,
    });
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
  }

  previous() {
    const viewMode = this.calendarApi().view.type as ViewMode;
    switch (viewMode) {
      case 'timeGridDay':
        if (!this.showWeekend() && this.selectedDate().getDay() === 1) {
          this.selectedDate.set(decrementDate(this.selectedDate(), 3, 'day'));
        } else {
          this.selectedDate.set(decrementDate(this.selectedDate(), 1, 'day'));
        }
        this.selectedRange.update((range) => ({
          start: decrementDate(range.start, 1, 'day'),
          end: decrementDate(range.end, 1, 'day'),
        }));
        break;
      case 'timeGridWeek':
        this.selectedRange.update((range) => ({
          start: decrementDate(range.start, 1, 'week'),
          end: decrementDate(range.end, 1, 'week'),
        }));
        this.selectedDate.set(decrementDate(this.selectedDate(), 1, 'week'));
        break;
      case 'dayGridMonth':
        this.selectedRange.update((range) => ({
          start: decrementDate(range.start, 1, 'month'),
          end: decrementDate(range.end, 1, 'month'),
        }));
        this.selectedDate.set(decrementDate(this.selectedDate(), 1, 'month'));
        break;
    }
    this.calendarApi().prev();
  }

  next() {
    const viewMode = this.calendarApi().view.type as ViewMode;
    switch (viewMode) {
      case 'timeGridDay':
        if (!this.showWeekend() && this.selectedDate().getDay() === 5) {
          this.selectedDate.set(incrementDate(this.selectedDate(), 3, 'day'));
        } else {
          this.selectedDate.set(incrementDate(this.selectedDate(), 1, 'day'));
        }
        this.selectedRange.update((range) => ({
          start: incrementDate(range.start, 1, 'day'),
          end: incrementDate(range.end, 1, 'day'),
        }));
        break;
      case 'timeGridWeek':
        this.selectedRange.update((range) => ({
          start: incrementDate(range.start, 1, 'week'),
          end: incrementDate(range.end, 1, 'week'),
        }));
        this.selectedDate.set(incrementDate(this.selectedDate(), 1, 'week'));
        break;
      case 'dayGridMonth':
        this.selectedRange.update((range) => ({
          start: incrementDate(range.start, 1, 'month'),
          end: incrementDate(range.end, 1, 'month'),
        }));
        this.selectedDate.set(incrementDate(this.selectedDate(), 1, 'month'));
        break;
    }
    this.calendarApi().next();
  }

  setToday() {
    this.selectedDate.set(new Date());
    this.calendarApi().today();
  }

  weekEndFilter = (d: Date | null): boolean => {
    if (this.showWeekend()) {
      return true;
    }
    const day = (d || new Date()).getDay();
    // Prevent Saturday and Sunday from being selected.
    return day !== 0 && day !== 6;
  };

  getCurrentDateInput() {
    const date = new Date();
    return {
      hour: date.getHours(),
      minute: date.getMinutes(),
    };
  }

  private handleDateSelect(selectInfo: DateSelectArg) {
    this.calendarApi().unselect(); // clear date selection
    this.openDialog(undefined, selectInfo.start, selectInfo.end);
  }

  public openDialog(eventId?: string, start?: Date, end?: Date) {
    this.matDialog
      .open(FullCalendarEventDialogComponent, {
        data: {
          eventId: eventId,
          start: start,
          end: end,
        },
        // width: '100%',
        maxWidth: 'none',
        maxHeight: '100%',
      })
      .afterClosed()
      .subscribe(() => this.calendarApi().refetchEvents());
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
    console.log('LALALAAL');
  }

  autoResize(arg: { view: ViewApi }) {
    setTimeout(() => this.calendarApi().updateSize(), 300);
  }

  toggleSidebar() {
    this.isSideBarOpen.set(!this.isSideBarOpen());
  }
}
