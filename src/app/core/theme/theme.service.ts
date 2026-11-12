import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';
import { THEMES } from './themes';

const KEY = 'app-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private doc = inject(DOCUMENT);
  readonly themes = THEMES;
  readonly current = signal<string>(this.initial());

  constructor() {
    effect(() => this.apply(this.current()));
  }

  set(id: string) {
    if (THEMES.some(t => t.id === id)) this.current.set(id);
  }

  private initial(): string {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && THEMES.some(t => t.id === saved)) return saved;
    } catch { /* storage blocked */ }
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private apply(id: string) {
    const root = this.doc.documentElement;
    THEMES.forEach(t => root.classList.remove(`theme-${t.id}`));
    root.classList.add(`theme-${id}`);
    try { localStorage.setItem(KEY, id); } catch { /* ignore */ }

    requestAnimationFrame(() => {
      const color = getComputedStyle(root).getPropertyValue('--mat-sys-surface').trim();
      this.doc.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
    });
  }
}