import { inject, Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';
import { SocketService } from '../socket/socket.service';

@Injectable({
  providedIn: 'root'
})
export class SonnerService {
  private readonly socketService = inject(SocketService);

  constructor() { 

  }

  public errorToast(err: string) {
    toast.error(err, {position: "bottom-right", closeButton: true});
  }
}
