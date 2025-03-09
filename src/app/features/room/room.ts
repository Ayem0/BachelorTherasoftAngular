import { FormControl } from '@angular/forms';

export interface Room extends RoomRequest {
  id: string;
  areaId: string;
  workspaceId: string;
  slotIds: string[];
  eventIds: string[];
}

export interface RoomRequest {
  name: string;
  description?: string;
}

export interface RoomForm {
  name: FormControl<string>;
  description?: FormControl<string>;
}
