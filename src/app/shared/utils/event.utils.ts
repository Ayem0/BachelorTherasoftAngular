import { DateRange, Event } from '../../features/event/models/event';

export function isIsRange(e: Event, range: DateRange) {
  return (
    // event with same date or starting before and ending after
    (e.startDate <= range.start && e.endDate >= range.end) ||
    // event starting after and ending before
    (e.startDate > range.start && e.endDate < range.end) ||
    // event starting before and ending before
    (e.startDate < range.start &&
      e.endDate > range.start &&
      e.endDate < range.end) ||
    // event starting after and ending after
    (e.startDate > range.start &&
      e.endDate > range.end &&
      e.startDate < range.end)
  );
}
