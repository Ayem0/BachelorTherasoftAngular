import { inject, Injectable } from '@angular/core';
import moment from 'moment-timezone';
import { LocaleService } from '../locale/locale.service';

type ManipulateDate =
  | 'millisecond'
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'month'
  | 'year'
  | 'week';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  private readonly locale = inject(LocaleService);
  private readonly tz = this.locale.currentTz;
  constructor() {}

  public incrementDate(date: Date, amount: number, unit: ManipulateDate) {
    return moment(date).add(amount, unit).toDate();
  }

  public decrementDate(date: Date, amount: number, unit: ManipulateDate) {
    return moment(date).subtract(amount, unit).toDate();
  }

  public toLocaleString(date: Date) {
    return moment(date).tz(this.tz()).format('YYYY-MM-DD HH:mm:ssZ');
  }

  public toUtcString(date: Date): string {
    return moment(date).utc().toISOString();
  }

  public toUtc(date: Date) {
    return moment(date).tz(this.tz()).utc(false).toDate();
  }

  public format(date: Date, format: string) {
    return moment(date).format(format);
  }

  public diffInDays(date1: Date, date2: Date) {
    const diff = moment(date2).diff(date1, 'day');
    if (diff < 1) return 1;
    console.log(date1, date2, diff);
    const date1time = date1.getHours() * 60 + date1.getMinutes();
    const date2time = date2.getHours() * 60 + date2.getMinutes();
    return date1time < date2time ? diff + 1 : diff;
  }
}
