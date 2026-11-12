import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './core/api/toast.service';
import { ThemeService } from './core/theme/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <router-outlet />
    @if (toast.message(); as message) {
      <div class="app-toast" role="status" aria-live="polite">
        <span>{{ message }}</span>
        <button type="button" aria-label="Dismiss notification" (click)="toast.dismiss()">×</button>
      </div>
    }
  `,
  styles: `
    .app-toast {
      position: fixed;
      z-index: 1100;
      right: 1.25rem;
      bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      max-width: min(28rem, calc(100vw - 2.5rem));
      padding: .875rem 1rem;
      border-radius: .5rem;
      color: #fff;
      background: #198754;
      box-shadow: 0 4px 16px rgba(0, 0, 0, .2);
    }
    .app-toast button {
      border: 0;
      padding: 0 .25rem;
      color: inherit;
      background: transparent;
      font-size: 1.25rem;
      line-height: 1;
    }
  `
})
export class App {
  protected readonly toast = inject(ToastService);
  private theme = inject(ThemeService);
}