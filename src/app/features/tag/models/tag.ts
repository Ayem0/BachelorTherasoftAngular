import { FormControl } from '@angular/forms';
import { FilterRelations } from '../../../shared/helpers/filter-relations.helper';
import { Entity, Id } from '../../../shared/models/entity';
import { Workspace } from '../../workspace/models/workspace';

interface TagRelations {
  workspace?: Workspace;
}

type BaseTag = {
  name: string;
  color: string;
  icon: string;
  description?: string;
  workspaceId: Id;
} & Entity;

export type Tag<R extends TagRelations = {}> = BaseTag & FilterRelations<R>;

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

export const UNKNOWN_TAG: Tag = {
  id: '',
  name: 'Unknown',
  color: '',
  icon: '',
  workspaceId: '',
};
