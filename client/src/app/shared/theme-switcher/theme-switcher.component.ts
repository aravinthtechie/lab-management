import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-theme-switcher',
  imports: [MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <button mat-icon-button type="button" [matMenuTriggerFor]="menu" aria-label="Change theme">
      <mat-icon>palette</mat-icon>
    </button>
    <mat-menu #menu="matMenu">
      @for (t of theme.themes; track t.id) {
        <button mat-menu-item type="button" role="menuitemradio"
                [attr.aria-checked]="theme.current() === t.id"
                (click)="theme.set(t.id)">
          <span class="dot" [style.background]="t.swatch"></span>
          <span>{{ t.label }}</span>
          @if (theme.current() === t.id) { <mat-icon>check</mat-icon> }
        </button>
      }
    </mat-menu>`,
  styles: `
    .dot { display: inline-block; width: 16px; height: 16px; margin-right: 12px;
           border-radius: 50%; border: 1px solid #8886; vertical-align: middle; }`
})
export class ThemeSwitcherComponent {
  protected theme = inject(ThemeService);
}