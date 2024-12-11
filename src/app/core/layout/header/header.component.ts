import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { ThemeService } from '../../../features/theme/theme.service';
import { SidebarService } from '../sidebar/sidebar.service';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { themes } from '../../../features/theme/theme';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-header',
    imports: [
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatTooltip,
        RouterLink,
        AsyncPipe
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent  {
  private readonly themeService = inject(ThemeService);
  private readonly sidebarService = inject(SidebarService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public themes = themes;

  public setTheme(theme: themes) {
    this.themeService.setTheme(theme);
  }

  public toggleMenu() {
    this.sidebarService.toggleSideBar();
  }

  public logout() {
    this.authService.logout().subscribe(res => {
      if (res) {
        this.router.navigateByUrl("login");
      }
    });
  }

  public isAuthenticated() {
    return this.authService.isAuthenticated();
  }
}
