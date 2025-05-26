import { FormControl } from '@angular/forms';
import { FilterRelations } from '../../../shared/helpers/filter-relations.helper';
import { Entity, Id } from '../../../shared/models/entity';
import { Interval } from '../../../shared/models/interval';

interface EventRelations {
  members?: unknown;
  room?: unknown;
  participants?: unknown;
  eventCategory?: unknown;
  tags?: unknown;
  workspace?: unknown;
}

type BaseEvent = {
  memberIds?: Id[];
  tagIds?: Id[];
  participantIds?: Id[];
  roomId?: Id;
  workspaceId?: Id;
  eventCategoryId?: Id;
  description?: string;
  startDate: Date;
  endDate: Date;
  repetitionInterval?: Interval;
  repetitionNumber?: number;
  repetitionEndDate?: Date;
} & Entity;

export type Event<R extends EventRelations = {}> = BaseEvent &
  FilterRelations<R>;

export interface EventRequest {
  description?: string;
  userIds: string[];
  startDate: Date;
  endDate: Date;
  roomId: string;
  repetitionInterval?: Interval;
  repetitionNumber?: number;
  repetitionEndDate?: Date;
  participantIds: string[];
  eventCategoryId: string;
  workspaceId: string;
  tagIds: string[];
}

export interface EventRequestForm {
  description: FormControl<string | undefined>;
  startDate: FormControl<Date>;
  endDate: FormControl<Date>;
  eventCategoryId: FormControl<string>;
  workspaceId: FormControl<string>;
  roomId: FormControl<string>;
  tagIds: FormControl<string[]>;
  participantIds: FormControl<string[]>;
  userIds: FormControl<string[]>;
  repetitionInterval: FormControl<Interval | undefined>;
  repetitionNumber: FormControl<number | undefined>;
  repetitionEndDate: FormControl<Date | undefined>;
}

export interface DateRange {
  start: Date;
  end: Date;
}

type year = number;
type month = number;
type day = number;
export type EventKey = `${Id}/${year}/${month}/${day}`;

export const UNKNOWN_EVENT: Event = {
  id: 'unknown',
  startDate: new Date(),
  endDate: new Date(),
};
