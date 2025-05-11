import { FormControl } from '@angular/forms';
import { Entity } from '../../../shared/models/entity';

export interface ContactForm {
  email: FormControl<string>;
}

export type Contact = {
  firstName: string;
  lastName: string;
} & Entity;
