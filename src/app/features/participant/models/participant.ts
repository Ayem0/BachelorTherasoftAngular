import { FormControl } from '@angular/forms';
import { ParticipantCategory } from '../../participant-category/models/participant-category';

export interface Participant {
  id: string;
  workspaceId: string;
  firstName: string;
  lastName: string;
  participantCategory: ParticipantCategory;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
  dateOfBirth?: Date;
}

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
