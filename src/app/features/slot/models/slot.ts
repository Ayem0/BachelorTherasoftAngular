import { FormControl } from '@angular/forms';
import { FilterRelations } from '../../../shared/helpers/filter-relations.helper';
import { Entity, Id } from '../../../shared/models/entity';
import { Interval } from '../../../shared/models/interval';

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

interface SlotRelations {
  workspace?: unknown;
  eventCategories?: unknown;
  rooms?: unknown;
}

type BaseSlot = {
  name: string;
  description?: string;
  startDate: Date;
  startTime: Date;
  endDate: Date;
  endTime: Date;
  repetitionInterval?: Interval;
  repetitionNumber?: number;
  repetitionEndDate?: Date;
} & Entity;

export type Slot<R extends SlotRelations = {}> = BaseSlot & FilterRelations<R>;

export type StoreSlot = BaseSlot & {
  workspaceId: Id;
};
