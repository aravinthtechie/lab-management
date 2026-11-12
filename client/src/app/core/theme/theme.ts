export interface AppTheme { id: string; label: string; swatch: string; }

export const THEMES: AppTheme[] = [
  { id: 'light',  label: 'Light',  swatch: '#0b6bcb' },
  { id: 'dark',   label: 'Dark',   swatch: '#1b1f27' },
  { id: 'ocean',  label: 'Ocean',  swatch: '#00829b' },
  { id: 'forest', label: 'Forest', swatch: '#2e7d32' },
  { id: 'sunset', label: 'Sunset', swatch: '#e65100' },
];