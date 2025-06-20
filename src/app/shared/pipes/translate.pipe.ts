import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { LanguageService } from '../services/language.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Hace que el pipe se actualice automáticamente
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription: Subscription = new Subscription();

  constructor(
    private translationService: TranslationService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {
    // Escuchar cambios de idioma
    this.subscription = this.languageService.currentLanguage$.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  transform(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}