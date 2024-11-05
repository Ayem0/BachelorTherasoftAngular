import { Component, inject, Injectable, Type } from '@angular/core';
import { toast, NgxSonnerToaster } from 'ngx-sonner';

@Injectable({
  providedIn: 'root'
})
export class SonnerService {
  
  constructor() { }
  public CreateToast(): void {
    // TODO mettre la promess et la data en param
    const promise = new Promise((resolve, reject) => setTimeout(() => {
      if (Math.random() > 0.5) {
        resolve({ name: 'ngx-sonner' });
      } else {
        reject();
      }
    }, 1500));
    
    toast.promise(promise, {
      loading: 'Loading...',
      // success: (data: unknown): Type<unknown> => {   // TODO utilisé ceci avec un composant qui a des input pour en faire un composant généric, faire la meme chose avec loading et success
      //   return Component
      // },
      success: (data: unknown): string => {
        return 'string'
      },
      error: 'Error... :( Try again!',
    });
  }
}
