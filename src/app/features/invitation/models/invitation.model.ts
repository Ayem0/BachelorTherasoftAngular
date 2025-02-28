import { User } from "../../../core/auth/models/auth";

export interface WorkspaceInvitation {
  id: string;
  invitationType: InvitationType;
  sender: User;
  receiver: User;
  workspaceId: string;
}

export interface EventInvitation {
  id: string;
  invitationType: InvitationType;
  sender: User;
  receiver: User;
  eventId: string;
}

export interface ContactInvitation {
  id: string;
  invitationType: InvitationType;
  sender: User;
  receiver: User;
}

export type Invitation =
  | WorkspaceInvitation
  | EventInvitation
  | ContactInvitation;

export enum InvitationType {
  Workspace,
  Event,
  Contact,
}
