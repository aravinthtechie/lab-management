import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly message = signal('');
  private timeoutId?: ReturnType<typeof setTimeout>;

  showSuccess(message: string): void {
    this.message.set(message);
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this.dismiss(), 5000);
  }

  dismiss(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = undefined;
    this.message.set('');
  }
}
