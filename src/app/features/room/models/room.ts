import { FormControl } from '@angular/forms';
import { FilterRelations } from '../../../shared/helpers/filter-relations.helper';
import { Entity, Id } from '../../../shared/models/entity';

export interface RoomRequest {
  name: string;
  description?: string;
}

export interface RoomForm {
  name: FormControl<string>;
  description?: FormControl<string>;
}

interface RoomRelations {
  workspace?: unknown;
  events?: unknown;
  area?: unknown;
  slots?: unknown;
}

type BaseRoom = {
  name: string;
  description?: string;
} & Entity;

export type Room<R extends RoomRelations = {}> = BaseRoom & FilterRelations<R>;

export type StoreRoom = BaseRoom & {
  workspaceId: Id;
  areaId: Id;
};
