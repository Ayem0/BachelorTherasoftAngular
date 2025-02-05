import { FormControl } from '@angular/forms';

export interface Tag extends TagRequest {
  id: string;
}

export interface TagRequest {
  name: string;
  color: string;
  icon: string;
  description?: string;
}

export interface TagForm {
  name: FormControl<string>;
  color: FormControl<string>;
  icon: FormControl<string>;
  description: FormControl<string | undefined>;
}
