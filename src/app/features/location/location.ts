import { FormControl } from '@angular/forms';
import { Area } from '../area/area';

export interface Place {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  areas: Area[];
}

export interface LocationRequest {
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface LocationForm {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
  address: FormControl<string | undefined>;
  city: FormControl<string | undefined>;
  country: FormControl<string | undefined>;
}
