import { FormControl } from '@angular/forms';
import { FilterRelations } from '../../../shared/helpers/filter-relations.helper';
import { Entity, Id } from '../../../shared/models/entity';

export interface EventCategoryRelations {
  workspace?: unknown;
}

type BaseEventCategory = {
  name: string;
  color: string;
  description?: string;
  workspaceId: Id;
} & Entity;

export type EventCategory<R extends EventCategoryRelations = {}> =
  BaseEventCategory & FilterRelations<R>;

export interface EventCategoryRequest {
  name: string;
  color: string;
  description?: string;
}

export interface EventCategoryForm {
  name: FormControl<string>;
  color: FormControl<string>;
  description: FormControl<string | undefined>;
}

export const UNKNOWN_EVENT_CATEGORY: EventCategory = {
  id: '',
  name: 'Unknown category',
  color: '#',
  workspaceId: '',
};
