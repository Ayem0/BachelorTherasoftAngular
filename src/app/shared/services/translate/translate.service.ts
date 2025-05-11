import { inject, Injectable } from '@angular/core';
import { TranslateService as NgxTranslateService } from '@ngx-translate/core';
import { Lang } from '../../models/lang';

@Injectable({
  providedIn: 'root',
})
export class TranslateService {
  private readonly ngxTranslateService = inject(NgxTranslateService);
  private readonly langKey = 'lang';
  private readonly validLangs: string[] = ['en', 'fr'];

  public loadLang() {
    this.ngxTranslateService.setDefaultLang('en');
    const storedLang = this.getLangFromLocalStorage();
    const browserLang = this.toLang(this.ngxTranslateService.getBrowserLang());
    const langToUse =
      storedLang ||
      browserLang ||
      (this.ngxTranslateService.getDefaultLang() as Lang);
    this.setLang(langToUse);
  }

  public setLang(lang: Lang) {
    const currentLang = this.ngxTranslateService.currentLang;
    if (currentLang !== lang) {
      this.ngxTranslateService.use(lang);
      localStorage.setItem(this.langKey, lang);
      document.documentElement.lang = lang;
    }
  }

  public getLang(): Lang {
    return this.ngxTranslateService.currentLang as Lang;
  }

  private getLangFromLocalStorage(): Lang | undefined {
    const storedLang = localStorage.getItem(this.langKey);
    return this.toLang(storedLang);
  }

  private toLang(lang: string | null | undefined): Lang | undefined {
    if (lang) {
      return this.validLangs.includes(lang) ? (lang as Lang) : undefined;
    }
    return undefined;
  }

  public translate(key: string): string {
    return this.ngxTranslateService.instant(key);
  }
}
