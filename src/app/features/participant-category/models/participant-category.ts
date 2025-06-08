import { FormControl } from '@angular/forms';
import { FilterRelations } from '../../../shared/helpers/filter-relations.helper';
import { Entity, Id } from '../../../shared/models/entity';

export interface ParticipantCategoryRequest {
  name: string;
  color: string;
  description?: string;
}

export interface ParticipantCategoryForm {
  name: FormControl<string>;
  color: FormControl<string>;
  description: FormControl<string | undefined>;
}

interface ParticipantCategoryRelations {
  workspace?: unknown;
}

type BaseParticipantCategory = {
  name: string;
  color: string;
  description?: string;
  workspaceId: Id;
} & Entity;

export type ParticipantCategory<R extends ParticipantCategoryRelations = {}> =
  BaseParticipantCategory & FilterRelations<R>;

export const UNKNOWN_PARTICIPANTCATEGORY: ParticipantCategory = {
  id: '',
  name: 'Unknown Category',
  color: '',
  workspaceId: '',
};
