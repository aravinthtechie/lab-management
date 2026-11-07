import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { MENU } from '../../core/menu/menu';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { LanguageSwitcherComponent } from '../../shared/language-switcher/language-switcher.component';
import { ThemeSwitcherComponent } from '../../shared/theme-switcher/theme-switcher.component';

@Component({
  selector: 'app-shell',
  imports: [DatePipe, NgTemplateOutlet, RouterLink, RouterLinkActive, RouterOutlet,
            MatButtonModule, MatIconModule, MatMenuModule, ThemeSwitcherComponent,
            LanguageSwitcherComponent, TranslatePipe],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  host: { '(document:keydown.escape)': 'menuOpen.set(false)' }
})
export class ShellComponent {
  protected auth = inject(AuthService);
  protected menuOpen = signal(false);

  private items = MENU.filter(m => !m.adminOnly || this.auth.isAdmin());
  protected groups = [
    { title: '', items: this.items.filter(m => m.section === 'main') },
    { title: 'Lab operations', items: this.items.filter(m => m.section === 'lab') },
    { title: 'Administration', items: this.items.filter(m => m.section === 'admin') },
  ].filter(g => g.items.length > 0);
}