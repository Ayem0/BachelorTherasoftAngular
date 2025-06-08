import { FormControl } from '@angular/forms';
import { FilterRelations } from '../../../shared/helpers/filter-relations.helper';
import { Entity } from '../../../shared/models/entity';
import { Slot, SlotRelations } from '../../slot/models/slot';

interface workspaceRelationsOptions {
  slots?: Slot<SlotRelations>[];
  workspaceRoles?: unknown;
  members?: unknown;
  tags?: unknown;
  locations?: unknown;
  participants?: unknown;
  participantCategories?: unknown;
  eventCategories?: unknown;
}

type BaseWorkspace = {
  name: string;
  color: string;
  description?: string;
} & Entity;

export type Workspace = BaseWorkspace &
  FilterRelations<workspaceRelationsOptions>;

export type StoreWorkspace = BaseWorkspace;

export interface WorkspaceRequest {
  name: string;
  color: string;
  description?: string;
}

export interface WorkspaceForm {
  name: FormControl<string>;
  color: FormControl<string>;
  description: FormControl<string | undefined>;
}

export const UNKNOW_WORKSPACE: Workspace = {
  id: '',
  name: 'Unknow Workspace',
  color: '#000000',
};
