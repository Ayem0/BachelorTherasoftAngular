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
  | 'year'
  | 'week';

export function incrementDate(
  date: Date,
  amount: number,
  unit: ManipulateDate
) {
  return dayjs(date).add(amount, unit).toDate();
}

export function decrementDate(
  date: Date,
  amount: number,
  unit: ManipulateDate
) {
  return dayjs(date).subtract(amount, unit).toDate();
}

export function dateTimeToDate(date: Date) {
  return new Date(dayjs(date).format('YYYY-MM-DD'));
}

export const toLocaleString = (date: Date): string => {
  return dayjs(date).utc().tz().format('YYYY-MM-DD HH:mm:ss');
};

export const toLocale = (date: Date): Date => {
  return dayjs(date).tz().toDate();
};

export function toUtc(date: Date) {
  return dayjs(date).utc().toDate();
}

export function getDifferenceInDays(date1: Date, date2: Date) {
  return dayjs(date1).diff(date2, 'day');
}
