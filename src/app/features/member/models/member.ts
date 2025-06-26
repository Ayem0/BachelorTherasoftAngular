import { FilterRelations } from '../../../shared/helpers/filter-relations.helper';
import { Entity, Id } from '../../../shared/models/entity';

export type BaseMember = {
  firstName: string;
  lastName: string;
  workspaceId: Id;
} & Entity;

export interface MemberRelations {
  workspace?: unknown;
  workspaceRoles?: unknown;
}
export type Member<R extends MemberRelations = {}> = BaseMember &
  FilterRelations<R>;

export type StoreMember = {
  workspaceId: Id;
  workspaceRoleIds: Id[];
} & BaseMember;

export const UNKNOW_MEMBER: Member = {
  id: '',
  firstName: 'Unkown',
  lastName: 'Member',
  workspaceId: '',
};
