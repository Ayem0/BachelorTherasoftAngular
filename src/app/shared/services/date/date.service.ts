import { inject, Injectable } from '@angular/core';
import moment, { Moment } from 'moment-timezone';
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

  public incrementDate(
    date: Moment,
    amount: number,
    unit: ManipulateDate
  ): Moment {
    return moment(date).add(amount, unit);
  }

  public decrementDate(
    date: Moment,
    amount: number,
    unit: ManipulateDate
  ): Moment {
    return moment(date).subtract(amount, unit);
  }

  public format(date: Date, format: string) {
    return moment(date).format(format);
  }

  public diffInDays(date1: Moment, date2: Moment) {
    const diff = moment(date2).diff(date1, 'day');
    if (diff < 1) return 1;
    console.log(date1, date2, diff);
    const date1time = date1.hours() * 60 + date1.minutes();
    const date2time = date2.hours() * 60 + date2.minutes();
    return date1time < date2time ? diff + 1 : diff;
  }
}
