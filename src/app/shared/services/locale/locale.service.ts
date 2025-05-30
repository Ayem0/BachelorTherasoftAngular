import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeFr from '@angular/common/locales/fr';
import { inject, Injectable, signal } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { TranslateService } from '../translate/translate.service';

registerLocaleData(localeFr);
registerLocaleData(localeEn);

@Injectable({
  providedIn: 'root',
})
export class LocaleService {
  private readonly adapter = inject(DateAdapter<Date>);
  private readonly locale = signal(inject<unknown>(MAT_DATE_LOCALE));
  private readonly translate = inject(TranslateService);

  constructor() {
    this.translate.currentLang$.subscribe((lang) => {
      this.locale.set(lang);
      this.adapter.setLocale(this.locale());
    });
  }
}
