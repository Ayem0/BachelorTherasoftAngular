import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Moment } from 'moment';

@Injectable({
  providedIn: 'root',
})
export class AgendaService {
  private isSideBarOpenKey = 'calendarSideBarOpen';
  private showWeekendsKey = 'calendarShowWeekends';

  public isSideBarOpen = signal<boolean>(this.getSideBarOpenFromLocalstorage());
  public showWeekend = signal<boolean>(this.getShowWeekendsFromLocalstorage());
  public showWeekendObs = toObservable(this.showWeekend);

  public weekEndFilter = (d: Moment | null): boolean => {
    if (this.showWeekend()) return true;
    if (!d) return false;
    const day = d.day();
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
