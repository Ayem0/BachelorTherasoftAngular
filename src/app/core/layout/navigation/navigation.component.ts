import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarService } from '../sidebar/sidebar.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    MatIcon,
    RouterLink,
    RouterLinkActive,
    MatButtonModule
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {
  private readonly sidebarService = inject(SidebarService);

  public toggleMenu() {
    this.sidebarService.toggleSideBar();
  }
}
