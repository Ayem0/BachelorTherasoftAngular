import { FormControl } from '@angular/forms';
import { FilterRelations } from '../../../shared/helpers/filter-relations.helper';
import { Entity, Id } from '../../../shared/models/entity';

export interface ParticipantForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  participantCategoryId: FormControl<string>;
  email: FormControl<string | undefined>;
  phoneNumber: FormControl<string | undefined>;
  address: FormControl<string | undefined>;
  city: FormControl<string | undefined>;
  country: FormControl<string | undefined>;
  description: FormControl<string | undefined>;
  dateOfBirth: FormControl<Date | undefined>;
}

interface ParticipantRelations {
  workspace?: unknown;
  participantCategory?: unknown;
}

type BaseParticipant = {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
  dateOfBirth?: Date;
  workspaceId: Id;
  participantCategoryId: Id;
} & Entity;

export type Participant<R extends ParticipantRelations = {}> = BaseParticipant &
  FilterRelations<R>;

export interface ParticipantRequest {
  firstName: string;
  lastName: string;
  participantCategoryId: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
  dateOfBirth?: Date;
}

export const UNKNOWN_PARTICIPANT: Participant = {
  id: '',
  firstName: 'Unknown',
  lastName: 'Participant',
  participantCategoryId: '',
  workspaceId: '',
};
