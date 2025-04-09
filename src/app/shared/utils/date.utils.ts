import dayjs from 'dayjs';

export function format(date: Date, format: string) {
  return dayjs(date).format(format);
}
