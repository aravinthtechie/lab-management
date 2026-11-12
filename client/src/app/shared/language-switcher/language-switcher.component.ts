import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppLanguage, LanguageService } from '../../core/i18n/language.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  template: `
    <label class="language-switcher">
      <span class="material-icons" aria-hidden="true">language</span>
      <select [ngModel]="language.language()" (ngModelChange)="changeLanguage($event)"
              [attr.aria-label]="'Change language' | translate">
        <option value="en">English</option>
        <option value="ta">தமிழ்</option>
      </select>
      <span class="material-icons expand" aria-hidden="true">expand_more</span>
    </label>
  `,
  styles: `
    :host { display: inline-flex; }
    .language-switcher {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      min-height: 38px;
      padding: 0 8px;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 6px;
      color: var(--mat-sys-on-surface);
    }
    .material-icons { font-size: 19px; }
    .expand { pointer-events: none; }
    select {
      max-width: 90px;
      border: 0;
      outline: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      font-size: 13px;
      appearance: none;
      cursor: pointer;
    }
  `,
})
export class LanguageSwitcherComponent {
  protected readonly language = inject(LanguageService);

  protected changeLanguage(language: AppLanguage): void {
    this.language.setLanguage(language);
  }
}
