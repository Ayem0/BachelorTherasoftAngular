import { Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';

@Injectable({
  providedIn: 'root',
})
export class SonnerService {
  constructor() {}

  public error(err: string) {
    toast.error(err);
  }

  public success(message: string, description: string | null = null) {
    toast.message(message, {
      description: description ?? undefined,
    });
  }
}
