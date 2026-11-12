import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { getApiErrorMessage } from '../../../core/api/api-error';
import { AuthService } from '../../../core/auth/auth.service';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { LanguageSwitcherComponent } from '../../../shared/language-switcher/language-switcher.component';
import { ThemeSwitcherComponent } from '../../../shared/theme-switcher/theme-switcher.component';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule,
            MatCheckboxModule, MatIconModule, MatProgressSpinnerModule,
            ThemeSwitcherComponent, LanguageSwitcherComponent, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected auth = inject(AuthService);

  protected hide = signal(true);
  protected loading = signal(false);
  protected resetLoading = signal(false);
  protected resetSent = signal(false);
  protected error = signal('');
  protected resetError = signal('');
  protected forgotPassword = signal(false);
  protected year = new Date().getFullYear();

  protected form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [false]
  });

  protected resetForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  openForgotPassword() {
    this.forgotPassword.set(true);
    this.resetSent.set(false);
    this.resetError.set('');
    this.resetForm.reset({ email: this.form.controls.username.value.includes('@')
      ? this.form.controls.username.value
      : '' });
  }

  backToLogin() {
    this.forgotPassword.set(false);
    this.resetError.set('');
  }

  requestPasswordReset() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.resetLoading.set(true);
    this.resetError.set('');
    this.auth.requestPasswordReset(this.resetForm.getRawValue()).subscribe({
      next: () => {
        this.resetSent.set(true);
        this.resetLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.resetError.set(getApiErrorMessage(
          err,
          err.status
            ? 'Unable to submit your reset request. Please try again later.'
            : 'Cannot reach the server. Please try again.',
        ));
        this.resetLoading.set(false);
      }
    });
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    const { username, password, remember } = this.form.getRawValue();
    this.auth.login({ username, password }, remember).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: HttpErrorResponse) => {
        this.error.set(getApiErrorMessage(
          err,
          err.status === 401
            ? 'Invalid username or password'
            : err.status
              ? 'Unable to sign in. Please try again.'
              : 'Cannot reach the server. Please try again.',
        ));
        this.loading.set(false);
      }
    });
  }

  googleSignIn() {
    this.error.set('Google sign-in is not configured yet.');
  }
}