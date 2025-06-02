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

  public toUtc(date: Date) {
    return dayjs(date).tz(this.tz()).toDate();
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
}
