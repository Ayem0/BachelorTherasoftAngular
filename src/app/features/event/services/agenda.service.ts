import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AgendaService {
  private isSideBarOpenKey = 'calendarSideBarOpen';
  private showWeekendsKey = 'calendarShowWeekends';

  public isSideBarOpen = signal<boolean>(this.getSideBarOpenFromLocalstorage());
  public showWeekends = signal<boolean>(this.getShowWeekendsFromLocalstorage());

  public setSideBarOpen(isOpen: boolean) {
    this.isSideBarOpen.set(isOpen);
    localStorage.setItem(this.isSideBarOpenKey, isOpen.toString());
  }

  private getSideBarOpenFromLocalstorage() {
    let isOpen = localStorage.getItem(this.isSideBarOpenKey);
    if (isOpen && isOpen === 'true') {
      return true;
    } else {
      return false;
    }
  }

  public setShowWeekends(showWeekends: boolean) {
    this.showWeekends.set(showWeekends);
    localStorage.setItem(this.showWeekendsKey, showWeekends.toString());
  }

  private getShowWeekendsFromLocalstorage() {
    let showWeekends = localStorage.getItem(this.showWeekendsKey);
    if (showWeekends && showWeekends === 'true') {
      return true;
    } else {
      return false;
    }
  }

  constructor() {}
}
