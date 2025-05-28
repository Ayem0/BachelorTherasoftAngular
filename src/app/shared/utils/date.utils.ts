import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export function format(date: Date, format: string) {
  return dayjs(date).format(format);
}

type ManipulateDate =
  | 'millisecond'
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'month'
  | 'year';

export function incrementDate(
  date: Date,
  amount: number,
  unit: ManipulateDate
) {
  return dayjs(date).add(amount, unit).toDate();
}

export function dateTimeToDate(date: Date) {
  return new Date(dayjs(date).format('YYYY-MM-DD'));
}

export function toUtc(date: Date) {
  return dayjs(date).utc().toDate();
}
