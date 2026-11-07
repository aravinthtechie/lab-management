import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-module-page',
  imports: [MatIconModule, TranslatePipe],
  template: `
    <h1 class="page-title mb-3">{{ title | translate }}</h1>
    <section class="lab-card text-center py-5">
      <mat-icon class="big">{{ icon }}</mat-icon>
      <h2 class="h5 mt-3">{{ title | translate }} module</h2>
      <p class="text-body-secondary mb-0">{{ desc | translate }}</p>
    </section>`,
  styles: `.big { width: 64px; height: 64px; font-size: 64px; color: var(--mat-sys-primary); }`
})
export class ModulePageComponent {
  private data = inject(ActivatedRoute).snapshot.data;
  protected title = this.data['title'] as string;
  protected icon = this.data['icon'] as string;
  protected desc = this.data['desc'] as string;
}