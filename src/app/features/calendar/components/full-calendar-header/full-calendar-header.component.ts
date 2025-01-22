import { Component, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSelect, MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-full-calendar-header',
  imports: [
    MatButtonModule,
    MatIcon,
    MatSelectModule
  ],
  templateUrl: './full-calendar-header.component.html',
  styleUrl: './full-calendar-header.component.scss'
})
export class FullCalendarHeaderComponent {
  public isSideBarOpen = model.required<boolean>();

  public toggleSidebar() {
    this.isSideBarOpen.set(!this.isSideBarOpen());
  }

}
