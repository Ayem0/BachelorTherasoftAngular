import { FormControl } from '@angular/forms';
import { Interval } from '../../shared/models/interval';

export interface Slot extends SlotRequest {
  id: string;
  mainSlotId?: string;
}

export interface SlotRequest {
  name: string;
  description?: string;
  startDate: Date;
  startTime: Date;
  endDate: Date;
  endTime: Date;
  repetitionInterval?: Interval;
  repetitionNumber?: number;
  repetitionEndDate?: Date;

  eventCategoryIds: string[];
}

export interface SlotForm {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
  startDate: FormControl<Date>;
  startTime: FormControl<Date>;
  endDate: FormControl<Date>;
  endTime: FormControl<Date>;
  repetitionInterval: FormControl<Interval | undefined>;
  repetitionNumber: FormControl<number | undefined>;
  repetitionEndDate: FormControl<Date | undefined>;
  eventCategoryIds: FormControl<string[]>;
}
