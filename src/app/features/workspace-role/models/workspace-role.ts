import { FormControl } from '@angular/forms';
import { FilterRelations } from '../../../shared/helpers/filter-relations.helper';
import { Entity, Id } from '../../../shared/models/entity';
import { Workspace } from '../../workspace/models/workspace';

interface WorkspaceRoleRelations {
  workspace?: Workspace;
}

type BaseWorkspaceRole = {
  name: string;
  description?: string;
  workspaceId: Id;
} & Entity;

export type WorkspaceRole<R extends WorkspaceRoleRelations = {}> =
  BaseWorkspaceRole & FilterRelations<R>;

export interface WorkspaceRoleRequest {
  name: string;
  description?: string;
}

export interface WorkspaceRoleForm {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
}

export const UNKNOW_WORKSPACE_ROLE: WorkspaceRole = {
  id: '0',
  name: 'Unknown Role',
  workspaceId: '',
};
