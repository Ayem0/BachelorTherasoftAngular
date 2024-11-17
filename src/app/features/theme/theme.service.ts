import { Injectable } from '@angular/core';
import { themes } from './theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly themeKey = "theme";
  private currentTheme: themes | null = null;

  public loadTheme() {
    const localTheme = this.getTheme();
    if (localTheme && localTheme === themes.dark || localTheme === themes.light) {
      this.setTheme(localTheme);
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.setTheme(themes.dark)
      } else {
        this.setTheme(themes.light)
      }
    }
  }

  /** Get theme from localstorage */
  private getTheme() {
    return localStorage.getItem(this.themeKey);
  }

  /** Set or remove dark mode */
  public setTheme(theme: themes) {
    if (!this.currentTheme || this.currentTheme != theme) {
      const html = document.documentElement;
      const classToRemove = theme === themes.dark ? themes.light : themes.dark;
      html.classList.remove(classToRemove);
      html.classList.add(theme);
      this.currentTheme = theme;
      localStorage.setItem(this.themeKey, theme);
    }
  }
}

