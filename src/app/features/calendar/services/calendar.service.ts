import { Injectable } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private calendar: FullCalendarComponent | null = null;

  public setCalendar(calendar: FullCalendarComponent) {
    this.calendar = calendar;
  }

  public async updateSize() {

    const api = this.calendar?.getApi()
    if (api) {
      console.log("icidsdsdsdd");
      setTimeout(() => api.updateSize(), 400);
    }
    console.log("icidd");
  }
}
