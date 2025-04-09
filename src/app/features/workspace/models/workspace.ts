import { FormControl } from '@angular/forms';
import { FilterRelations } from '../../../shared/helpers/filter-relations.helper';
import { Entity } from '../../../shared/models/entity';

interface workspaceRelationsOptions {
  slots?: unknown;
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
  description?: string;
} & Entity;

export type Workspace = BaseWorkspace &
  FilterRelations<workspaceRelationsOptions>;

export type StoreWorkspace = BaseWorkspace;

export interface WorkspaceRequest {
  name: string;
  description?: string;
}

export interface WorkspaceForm {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
}
