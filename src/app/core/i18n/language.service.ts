import { Injectable, signal } from '@angular/core';
import dictionaries from './translations.json';

export type AppLanguage = 'en' | 'ta';

const translations = dictionaries as Record<AppLanguage, Record<string, string>>;
const storageKey = 'labcare-language';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly languageSignal = signal<AppLanguage>(this.readSavedLanguage());

  readonly language = this.languageSignal.asReadonly();

  setLanguage(language: AppLanguage): void {
    this.languageSignal.set(language);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey, language);
    }
  }

  translate(key: string): string {
    return translations[this.languageSignal()][key] ?? key;
  }

  private readSavedLanguage(): AppLanguage {
    const saved = typeof localStorage !== 'undefined'
      ? localStorage.getItem(storageKey)
      : null;
    return saved === 'ta' ? 'ta' : 'en';
  }
}
