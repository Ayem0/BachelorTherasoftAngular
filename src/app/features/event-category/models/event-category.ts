import { FormControl } from '@angular/forms';
import { FilterRelations } from '../../../shared/helpers/filter-relations.helper';
import { Entity, Id } from '../../../shared/models/entity';

interface eventCategoryRelations {
  workspace?: unknown;
}

type BaseEventCategory = {
  name: string;
  color: string;
  icon: string;
  description?: string;
} & Entity;

export type StoreEventCategory = BaseEventCategory & {
  workspaceId: Id;
};

export type EventCategory = BaseEventCategory &
  FilterRelations<eventCategoryRelations>;

export interface EventCategoryRequest {
  name: string;
  color: string;
  icon: string;
  description?: string;
}
export interface EventCategoryForm {
  name: FormControl<string>;
  color: FormControl<string>;
  icon: FormControl<string>;
  description: FormControl<string | undefined>;
}
