import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { Theme } from '../../../features/theme/theme';
import { ThemeService } from '../../../features/theme/theme.service';
import { Lang } from '../../../shared/models/lang';
import { TranslateService } from '../../../shared/services/translate/translate.service';
import { AuthService } from '../../auth/services/auth.service';
import { SidebarService } from '../sidebar/sidebar.service';

@Component({
  selector: 'app-header',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltip,
    RouterLink,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly themeService = inject(ThemeService);
  private readonly sidebarService = inject(SidebarService);
  private readonly authService = inject(AuthService);
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);

  public isLoggedIn = this.authService.isLoggedIn;

  public setTheme(theme: Theme) {
    this.themeService.setTheme(theme);
  }

  public toggleMenu() {
    this.sidebarService.toggleSideBar();
  }

  public setLang(lang: Lang) {
    this.translateService.setLang(lang);
  }

  public logout() {
    this.authService.logout().subscribe((res) => {
      if (res) {
        this.router.navigateByUrl('login');
      }
    });
  }
}
