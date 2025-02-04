import { Interval } from '../../../shared/models/interval';

export interface Event extends EventRequest {
  id: string;
}

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
