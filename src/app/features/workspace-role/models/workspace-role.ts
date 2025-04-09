import { FormControl } from '@angular/forms';
import { FilterRelations } from '../../../shared/helpers/filter-relations.helper';
import { Entity, Id } from '../../../shared/models/entity';

interface WorkspaceRoleRelations {
  workspace?: unknown;
}

type BaseWorkspaceRole = {
  name: string;
  description?: string;
} & Entity;

export type WorkspaceRole<R extends WorkspaceRoleRelations = {}> =
  BaseWorkspaceRole & FilterRelations<R>;

export type StoreWorkspaceRole = BaseWorkspaceRole & {
  workspaceId: Id;
};

export interface WorkspaceRoleRequest {
  name: string;
  description?: string;
}

export interface WorkspaceRoleForm {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
}
