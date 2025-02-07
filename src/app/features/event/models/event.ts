import { FormControl } from '@angular/forms';
import { Entity } from '../../../shared/models/entity';
import { Interval } from '../../../shared/models/interval';

export interface Event extends EventRequest, Entity {}

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
