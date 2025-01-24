import { User } from '../../../core/auth/models/auth';
import { Interval } from '../../../shared/models/interval';
import { EventCategory } from '../../event-category/event-category';
import { Participant } from '../../participant/participant';
import { Room } from '../../room/room';
import { Tag } from '../../tag/tag';

export interface Event {
  id: string;
  description?: string;
  users: User[];
  startDate: Date;
  endDate: Date;
  room: Room;
  repetitionInterval?: Interval;
  repetitionNumber?: number;
  repetitionEndDate?: Date;
  participants: Participant[];
  eventCategory: EventCategory;
  tags: Tag[];
}
