import { inject, Injectable } from '@angular/core';
import dayjs from 'dayjs';
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
    return dayjs(date).add(amount, unit).toDate();
  }

  public decrementDate(date: Date, amount: number, unit: ManipulateDate) {
    return dayjs(date).subtract(amount, unit).toDate();
  }

  public toFakeUtc(date: Date): Date {
    const offsetMs = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offsetMs);
  }

  public localeToUtc(date: Date | string) {
    return dayjs.tz(date, this.tz()).utc().toDate();
  }

  public toLocale(date: Date) {
    return dayjs(date).tz(this.tz()).toDate();
  }
  public toLocaleString(date: Date) {
    return dayjs(date).tz(this.tz()).format('YYYY-MM-DD HH:mm:ssZ');
  }

  public toUtcString(date: Date): string {
    return dayjs(date).utc().toISOString();
  }

  public format(date: Date, format: string) {
    return dayjs(date).format(format);
  }

  public diffInDays(date1: Date, date2: Date) {
    const diff = dayjs(date2).diff(date1, 'day');
    if (diff < 1) return 1;
    console.log(date1, date2, diff);
    const date1time = date1.getHours() * 60 + date1.getMinutes();
    const date2time = date2.getHours() * 60 + date2.getMinutes();
    return date1time < date2time ? diff + 1 : diff;
  }
}
