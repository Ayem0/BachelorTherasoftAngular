import { FormControl } from '@angular/forms';
import { FilterRelations } from '../../../shared/helpers/filter-relations.helper';
import { Entity } from '../../../shared/models/entity';

interface LocationRelations {
  workspace?: unknown;
  events?: unknown;
  area?: unknown;
  slots?: unknown;
}

type BaseLocation = {
  workspaceId: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
} & Entity;

export type Location<R extends LocationRelations = {}> = BaseLocation &
  FilterRelations<R>;

export const UNKNOW_LOCATION: Location = {
  id: '',
  name: 'Unknown Room',
  workspaceId: '',
};

export interface LocationRequest {
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface LocationForm {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
  address: FormControl<string | undefined>;
  city: FormControl<string | undefined>;
  country: FormControl<string | undefined>;
}
