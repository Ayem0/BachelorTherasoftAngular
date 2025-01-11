import { ApplicationConfig, inject, provideAppInitializer, provideExperimentalZonelessChangeDetection, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/auth/interceptors/auth.interceptor';
import { AuthService } from './core/auth/services/auth.service';
import { firstValueFrom } from 'rxjs';
import { ThemeService } from './features/theme/theme.service';



export const appConfig: ApplicationConfig = {
  providers: [
    // provideZoneChangeDetection({ eventCoalescing: true }), 
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes), 
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAppInitializer(async () => { 
      const authService = inject(AuthService)
      await firstValueFrom(authService.getUserInfo()) 
    }),
    provideAppInitializer(() => { 
      const themeService = inject(ThemeService)
      themeService.loadTheme() 
    })
  ]
};
