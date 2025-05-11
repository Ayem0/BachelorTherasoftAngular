import dayjs from 'dayjs';

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

export function add(date: Date, amount: number, unit: ManipulateDate) {
  return dayjs(date).add(amount, unit).toDate();
}

export function dateTimeToDate(date: Date) {
  return new Date(dayjs(date).format('YYYY-MM-DD'));
}
