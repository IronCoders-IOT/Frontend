import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-language-toggle',
  template: `
    <div class="language-toggle">
      <button 
        class="language-btn" 
        [class.active]="currentLanguage === 'en'"
        (click)="changeLanguage('en')">
        EN
      </button>
      <button 
        class="language-btn" 
        [class.active]="currentLanguage === 'es'"
        (click)="changeLanguage('es')">
        ES
      </button>
    </div>
  `,
  styleUrls: ['./language-toggle.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class LanguageToggleComponent {
  currentLanguage: string;

  constructor(private languageService: LanguageService) {
    this.currentLanguage = this.languageService.getCurrentLanguage();
  }

  changeLanguage(language: string): void {
    this.languageService.changeLanguage(language);
    this.currentLanguage = language;
  }
}