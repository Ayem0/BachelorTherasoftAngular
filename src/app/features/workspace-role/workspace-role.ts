import { FormControl } from '@angular/forms';

export interface WorkspaceRole extends WorkspaceRoleRequest {
  workspaceId: string;
  id: string;
}

export interface WorkspaceRoleRequest {
  name: string;
  description?: string;
}

export interface WorkspaceRoleForm {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
}
