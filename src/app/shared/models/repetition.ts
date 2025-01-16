import { DayOfWeek } from "./dayOfWeek";
import { Interval } from "./interval";

export interface Repetition {
    number?: number,
    interval?: Interval,
    days?: DayOfWeek[],
    endDate?: Date
}