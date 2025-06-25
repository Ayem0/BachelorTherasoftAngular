import { Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';

@Injectable({
  providedIn: 'root',
})
export class SonnerService {
  constructor() {}

  public error(message: string, description?: string) {
    toast.error(message, { description: description });
  }

  public success(
    message: string,
    description?: string,
    cancel?: { label: string; onClick: () => void }
  ) {
    toast.message(message, { description: description, cancel: cancel });
  }

  public info(message: string, description?: string) {
    toast.info(message, { description: description });
  }

  public warning(message: string, description?: string) {
    toast.warning(message, { description: description });
  }
}
