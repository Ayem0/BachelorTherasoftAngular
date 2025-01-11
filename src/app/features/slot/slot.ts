import { EventCategory } from "../event-category/event-category";
import { Interval } from "../../shared/models/interval";

export interface Slot {
    id: string,
    name: string,
    description?: string,
    startDate: Date,
    startTime: Date,
    endDate: Date,
    endTime: Date,
    repetitionInterval?: Interval,
    repetitionNumber?: number,
    repetitionEndDate?: Date,
    eventCategories: EventCategory[]
}