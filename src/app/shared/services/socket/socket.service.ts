import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private connection: signalR.HubConnection = new signalR.HubConnectionBuilder()
    .withUrl(`${environment.apiUrl}/hub`)
    .withAutomaticReconnect()
    .build();

  public async startConnection() {
    await this.connection.start();
    console.log('Socket connection started');
    this.connection.onclose(() => {
      console.log('Socket connection closed');
    });
    this.connection.onreconnected(() => {
      console.log('Socket connection reestablished');
    });
    this.connection.onreconnecting(() => {
      console.log('Socket connection lost, reconnecting...');
    });
  }

  public onEvent<T>(eventName: string, callback: (data: T) => void): void {
    this.connection.on(eventName, callback);
  }

  public async endConnection() {
    await this.connection.stop();
  }
}
