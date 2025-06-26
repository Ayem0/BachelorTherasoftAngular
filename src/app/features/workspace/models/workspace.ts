import { FormControl } from '@angular/forms';
import { FilterRelations } from '../../../shared/helpers/filter-relations.helper';
import { Entity } from '../../../shared/models/entity';
import {
  EventCategory,
  EventCategoryRelations,
} from '../../event-category/models/event-category';
import { Location, LocationRelations } from '../../location/models/location';
import { Member, MemberRelations } from '../../member/models/member';
import {
  ParticipantCategory,
  ParticipantCategoryRelations,
} from '../../participant-category/models/participant-category';
import {
  Participant,
  ParticipantRelations,
} from '../../participant/models/participant';
import { Slot, SlotRelations } from '../../slot/models/slot';
import { Tag, TagRelations } from '../../tag/models/tag';
import {
  WorkspaceRole,
  WorkspaceRoleRelations,
} from '../../workspace-role/models/workspace-role';

export interface WorkspaceRelations {
  slots?: Slot<SlotRelations>[];
  workspaceRoles?: WorkspaceRole<WorkspaceRoleRelations>[];
  members?: Member<MemberRelations>[];
  tags?: Tag<TagRelations>[];
  locations?: Location<LocationRelations>[];
  participants?: Participant<ParticipantRelations>[];
  participantCategories?: ParticipantCategory<ParticipantCategoryRelations>[];
  eventCategories?: EventCategory<EventCategoryRelations>[];
}

type BaseWorkspace = {
  name: string;
  color: string;
  description?: string;
} & Entity;

export type Workspace<R extends WorkspaceRelations = {}> = BaseWorkspace &
  FilterRelations<R>;

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
