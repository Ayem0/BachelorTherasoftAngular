import { FilterRelations } from '../../../shared/helpers/filter-relations.helper';
import { Entity, Id } from '../../../shared/models/entity';

interface BaseInvitationRelations {
  sender?: unknown;
  receiver?: unknown;
}

interface BaseInvitation {
  invitationType: InvitationType;
  senderId: Id;
  receiverId: Id;
}

interface EventInvitationRelations extends BaseInvitationRelations {
  event?: unknown;
}

interface WorkspaceInvitationRelations extends BaseInvitationRelations {
  workspace?: unknown;
}

export type ContactInvitation<R extends BaseInvitationRelations = {}> =
  BaseInvitation &
    FilterRelations<R> & {
      invitationType: InvitationType.Contact;
    } & Entity;

export type WorkspaceInvitation<R extends WorkspaceInvitationRelations = {}> =
  BaseInvitation &
    FilterRelations<R> & {
      workspaceId: Id;
      invitationType: InvitationType.Workspace;
    } & Entity;

export type EventInvitation<R extends EventInvitationRelations = {}> =
  BaseInvitation &
    FilterRelations<R> & {
      eventId: Id;
      invitationType: InvitationType.Event;
    } & Entity;

export type Invitation =
  | WorkspaceInvitation
  | EventInvitation
  | ContactInvitation;

export enum InvitationType {
  Workspace = 0,
  Event = 1,
  Contact = 2,
}

export const UNKNOW_INVITATION: Invitation = {
  id: '',
  invitationType: InvitationType.Contact,
  senderId: '',
  receiverId: '',
};
