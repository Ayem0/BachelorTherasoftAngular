import { DateRange, Event } from '../../features/event/models/event';

export function isIsRange(event: Event, dateRange: DateRange) {
  return (
    // event with same date or starting before and ending after
    (event.startDate <= dateRange.start && event.endDate >= dateRange.end) ||
    // event starting after and ending before
    (event.startDate > dateRange.start && event.endDate < dateRange.end) ||
    // event starting before and ending before
    (event.startDate < dateRange.start &&
      event.endDate > dateRange.start &&
      event.endDate < dateRange.end) ||
    // event starting after and ending after
    (event.startDate > dateRange.start &&
      event.endDate > dateRange.end &&
      event.startDate < dateRange.end)
  );
}
