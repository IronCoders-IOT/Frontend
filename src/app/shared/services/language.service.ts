import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly LANGUAGE_KEY = 'selected_language';
  
  private languages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  private currentLanguageSubject = new BehaviorSubject<string>('en');
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  constructor() {
    this.loadStoredLanguage();
  }

  private loadStoredLanguage(): void {
    const storedLanguage = localStorage.getItem(this.LANGUAGE_KEY);
    if (storedLanguage && this.isValidLanguage(storedLanguage)) {
      this.currentLanguageSubject.next(storedLanguage);
    }
  }

  changeLanguage(languageCode: string): void {
    if (this.isValidLanguage(languageCode)) {
      localStorage.setItem(this.LANGUAGE_KEY, languageCode);
      this.currentLanguageSubject.next(languageCode);
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  getLanguages(): Language[] {
    return this.languages;
  }

  getCurrentLanguageName(): string {
    const current = this.languages.find(lang => lang.code === this.getCurrentLanguage());
    return current ? current.name : 'English';
  }

  getCurrentLanguageFlag(): string {
    const current = this.languages.find(lang => lang.code === this.getCurrentLanguage());
    return current ? current.flag : '🇺🇸';
  }

  private isValidLanguage(code: string): boolean {
    return this.languages.some(lang => lang.code === code);
  }
}
