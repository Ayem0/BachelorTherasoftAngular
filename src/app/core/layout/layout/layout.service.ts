import { Injectable, signal } from '@angular/core';
import { fromEvent, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  constructor() {
    fromEvent(window, 'resize').pipe(
      map(() => window.innerWidth),
    ).subscribe(width => {
        this.windowWidth.set(width);
    });
  }

  public windowWidth = signal<number>(window.innerWidth);
  
}
