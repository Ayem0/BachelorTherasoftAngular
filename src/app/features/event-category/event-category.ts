import { FormControl } from '@angular/forms';

export interface EventCategory {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  icon: string;
  description?: string;
}
export interface EventCategoryRequest {
  name: string;
  color: string;
  icon: string;
  description?: string;
}
export interface EventCategoryForm {
  name: FormControl<string>;
  color: FormControl<string>;
  icon: FormControl<string>;
  description: FormControl<string | undefined>;
}
