import { DayOfWeek } from './day-of-week';
import { Interval } from './interval';

export interface Repetition {
  number?: number;
  interval?: Interval;
  days?: DayOfWeek[];
  endDate?: Date;
}
