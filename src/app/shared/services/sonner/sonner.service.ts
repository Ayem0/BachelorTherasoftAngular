import { inject, Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';
import { SocketService } from '../socket/socket.service';

@Injectable({
  providedIn: 'root',
})
export class SonnerService {
  private readonly socketService = inject(SocketService);

  constructor() {}

  public error(err: string) {
    toast.error(err);
  }

  public success(message: string, description: string) {
    toast.message(message, {
      description: description,
    });
  }
}
