import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private leftSidebar: MatSidenav | null = null;
  constructor() {}

  public setSideBar(sidebar: MatSidenav) {
    this.leftSidebar = sidebar;
  }

  public toggleSideBar() {
    if (this.leftSidebar) {
      this.leftSidebar.toggle();
    }
  }
}
