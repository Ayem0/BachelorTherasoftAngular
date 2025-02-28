import { FormControl } from '@angular/forms';
import { Entity } from '../../shared/models/entity';
import { Room } from '../room/room';

export interface Area extends Entity {
  name: string;
  description?: string;
  rooms: Room[];
}

export interface AreaRequest {
  name: string;
  description?: string;
}

export interface AreaForm {
  name: FormControl<string>;
  description: FormControl<string | undefined>;
}
