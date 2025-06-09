import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class AgendaService {
  private isSideBarOpenKey = 'calendarSideBarOpen';
  private showWeekendsKey = 'calendarShowWeekends';

  public isSideBarOpen = signal<boolean>(this.getSideBarOpenFromLocalstorage());
  public showWeekend = signal<boolean>(this.getShowWeekendsFromLocalstorage());
  public showWeekendObs = toObservable(this.showWeekend);

  public weekEndFilter = (d: Date | null): boolean => {
    if (this.showWeekend()) return true;
    const day = (d || new Date()).getDay();
    return day !== 0 && day !== 6;
  };

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
    this.showWeekend.set(showWeekends);
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
