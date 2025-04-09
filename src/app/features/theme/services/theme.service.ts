import { Injectable } from '@angular/core';
import { Theme } from '../models/theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly themeKey = 'theme';
  private currentTheme: Theme | null = null;

  /** Initial load of the theme */
  public loadTheme() {
    const localTheme = this.getTheme();
    if ((localTheme && localTheme === 'dark') || localTheme === 'light') {
      this.setTheme(localTheme);
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.setTheme('dark');
      } else {
        this.setTheme('light');
      }
    }
  }

  /** Get theme from localstorage */
  private getTheme() {
    return localStorage.getItem(this.themeKey);
  }

  /** Set or remove dark mode */
  public setTheme(theme: Theme) {
    if (!this.currentTheme || this.currentTheme != theme) {
      const html = document.documentElement;
      const classToRemove = theme === 'dark' ? 'light' : 'dark';
      html.classList.remove(classToRemove);
      html.classList.add(theme);
      this.currentTheme = theme;
      localStorage.setItem(this.themeKey, theme);
    }
  }
}
