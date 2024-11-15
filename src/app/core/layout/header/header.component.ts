import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { ThemeService } from '../../../features/theme/theme.service';
import { themes } from '../../../features/theme/theme.const';
import { SidebarService } from '../sidebar/sidebar.service';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltip,
    RouterLink
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  private readonly themeService = inject(ThemeService);
  private readonly sidebarService = inject(SidebarService);
  private readonly authService = inject(AuthService);

  public isLoggedIn = this.authService.isLoggedIn;


  public themes = themes;

  ngOnInit(): void {
    this.themeService.loadTheme();
    
  }

  public setTheme(theme: themes) {
    this.themeService.setTheme(theme);
  }

  public toggleMenu() {
    this.sidebarService.toggleSideBar();
  }
}
