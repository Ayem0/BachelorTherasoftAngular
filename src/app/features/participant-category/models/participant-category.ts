import { FormControl } from '@angular/forms';

export interface ParticipantCategory {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  icon: string;
  description?: string;
}

export interface ParticipantCategoryRequest {
  name: string;
  color: string;
  icon: string;
  description?: string;
}

export interface ParticipantCategoryForm {
  name: FormControl<string>;
  color: FormControl<string>;
  icon: FormControl<string>;
  description: FormControl<string | undefined>;
}
