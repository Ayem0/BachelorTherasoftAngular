import { afterNextRender, Component, inject } from '@angular/core';
import { LayoutComponent } from './core/layout/layout/layout.component';
import { ThemeService } from './features/theme/theme.service';


@Component({
    selector: 'app-root',
    imports: [
        LayoutComponent
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent  {
  title = 'BachelorTherasoftAngular';
  private readonly themeService = inject(ThemeService);

  constructor() {
    afterNextRender(() => {
      this.themeService.loadTheme();
    })
  }
}
