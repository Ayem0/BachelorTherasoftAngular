import { Component, inject, Injectable, Type } from '@angular/core';
import { toast, NgxSonnerToaster } from 'ngx-sonner';

@Injectable({
  providedIn: 'root'
})
export class SonnerService {
  
  constructor() { }

  public errorToast(err: string) {
    toast.error(err, {position: "bottom-right", closeButton: true});
  }


}
