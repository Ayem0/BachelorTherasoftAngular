import { inject, Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';
import { SocketService } from '../socket/socket.service';

@Injectable({
  providedIn: 'root',
})
export class SonnerService {
  private readonly socketService = inject(SocketService);

  constructor() {}

  public errorToast(err: string) {
    console.log('SONNER ERROR: ', err);
    toast.error(err);
  }

  public showToast(message: string, description: string) {
    toast.message(message, {
      description: description,
    });
  }
}
