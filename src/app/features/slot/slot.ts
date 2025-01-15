import { Interval } from "../../shared/models/interval";

export interface Slot {
    id: string,
    name: string,
    description?: string,
    startDate: Date | string,
    startTime: Date | string,
    endDate: Date | string,
    endTime: Date | string,
    repetitionInterval?: Interval,
    repetitionNumber?: number,
    repetitionEndDate?: Date,
    mainSlotId?: string,
    eventCategoryIds: string[]
}