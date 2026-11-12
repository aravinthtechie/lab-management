import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('shows all eight settings categories', () => {
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.category-button').length).toBe(8);
  });

  it('saves settings to browser storage and restores them in a new instance', () => {
    const fixture = TestBed.createComponent(SettingsComponent);
    fixture.detectChanges();
    fixture.componentInstance['form'].controls['labName'].setValue('Central Lab');
    fixture.detectChanges();
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(JSON.parse(localStorage.getItem('labcare.settings.v1') ?? '{}').labName).toBe('Central Lab');
    expect(fixture.nativeElement.textContent).toContain('saved in this browser');

    const restored = TestBed.createComponent(SettingsComponent);
    expect(restored.componentInstance['form'].controls['labName'].value).toBe('Central Lab');
  });
});
