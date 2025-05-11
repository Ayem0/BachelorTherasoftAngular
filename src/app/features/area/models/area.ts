import { FormControl } from '@angular/forms';
import { FilterRelations } from '../../../shared/helpers/filter-relations.helper';
import { Entity, Id } from '../../../shared/models/entity';

export interface AreaRequest {
  name: string;
  description?: string;
}

export interface AreaForm {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
}

interface AreaRelations {
  workspace?: unknown;
  location?: unknown;
}

type BaseArea = {
  name: string;
  description?: string;
  workspaceId: Id;
  locationId: Id;
} & Entity;

export type Area<R extends AreaRelations = {}> = BaseArea & FilterRelations<R>;

export const UNKNOW_AREA: Area = {
  id: '',
  name: 'Unknown Area',
  workspaceId: '',
  locationId: '',
};
