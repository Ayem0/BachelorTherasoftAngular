import { inject, Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { CalendarService } from '../../../features/calendar/services/calendar.service';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private leftSidebar: MatSidenav | null = null;
  private readonly calendarService = inject(CalendarService);
  constructor() { }

  public setSideBar(sidebar: MatSidenav) {
    this.leftSidebar = sidebar;
  }

  public toggleSideBar() {
    if (this.leftSidebar) {
      this.leftSidebar.toggle();
      this.calendarService.updateSize();
    }
  }
}