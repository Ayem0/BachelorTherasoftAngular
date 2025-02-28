import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private connection : signalR.HubConnection | null = null;

  constructor() { }
  
  startConnection() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/workspace`)
      .withAutomaticReconnect()
      .build();

    this.connection
      .start()
      .then(() => console.log('SignalR connection started.'))
      .catch((err) => console.error('Error while starting SignalR connection:', err));
  }

  onEvent<T>(eventName: string, callback: (data: T) => void): void {
    if (this.connection) {
      this.connection.on(eventName, callback);
    }
  }

  endConnection() {
    if (this.connection) {
      this.connection.stop();
    }
  }
}
