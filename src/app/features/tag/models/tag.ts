import { FormControl } from '@angular/forms';
import { FilterRelations } from '../../../shared/helpers/filter-relations.helper';
import { Entity, Id } from '../../../shared/models/entity';

interface TagRelations {
  workspace?: unknown;
}

type BaseTag = {
  name: string;
  color: string;
  icon: string;
  description?: string;
} & Entity;

export type Tag<R extends TagRelations = {}> = BaseTag & FilterRelations<R>;

export type StoreTag = {
  workspaceId: Id;
} & BaseTag;

export interface TagRequest {
  name: string;
  color: string;
  icon: string;
  description?: string;
}

export interface TagForm {
  name: FormControl<string>;
  color: FormControl<string>;
  icon: FormControl<string>;
  description: FormControl<string | undefined>;
}
