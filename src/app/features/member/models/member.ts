import { WorkspaceRole } from '../../workspace-role/models/workspace-role';

export interface Member {
  id: string;
  workspaceId: string;
  firstName: string;
  lastName: string;
  roles: WorkspaceRole[];
}
