import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { getApiErrorMessage, getApiSuccessMessage } from '../../core/api/api-error';
import { ToastService } from '../../core/api/toast.service';
import { MOBILE_NUMBER_ERROR, MOBILE_NUMBER_LENGTH, mobileNumberValidators } from '../../core/validation/mobile-number';
import { ManagementService } from './management.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="management-card">
      <header class="management-header">
        <span class="material-icons" aria-hidden="true">manage_accounts</span>
        <h1>User Management</h1>
      </header>
      <div class="management-body">
      <form #userForm [formGroup]="form" (ngSubmit)="save()" novalidate>
        @if (error) { <div class="alert alert-danger" role="alert">{{ error }}</div> }

        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label" for="fullName">Full name <span class="text-danger">*</span></label>
            <input id="fullName" class="form-control" formControlName="fullName" maxlength="120"
                   placeholder="Enter full name">
            @if (invalid('fullName')) {
              <small class="text-danger">
                @if (form.controls.fullName.hasError('required')) { Enter a full name. }
                @else { Full name must be 120 characters or fewer. }
              </small>
            }
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label" for="username">Username <span class="text-danger">*</span></label>
            <input id="username" class="form-control" formControlName="username" autocomplete="username"
                   maxlength="50" placeholder="Choose a username">
            @if (invalid('username')) {
              <small class="text-danger">
                @if (form.controls.username.hasError('required')) { Enter a username. }
                @else if (form.controls.username.hasError('minlength')) { Username must be at least 3 characters. }
                @else { Username must be 50 characters or fewer. }
              </small>
            }
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label" for="userEmail">Email <span class="text-danger">*</span></label>
            <input id="userEmail" class="form-control" type="email" formControlName="email"
                   autocomplete="email" placeholder="name@example.com">
            @if (invalid('email')) {
              <small class="text-danger">
                @if (form.controls.email.hasError('required')) { Enter an email address. }
                @else { Enter a valid email address. }
              </small>
            }
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label" for="userPhone">Phone</label>
            <input id="userPhone" class="form-control" type="tel" formControlName="phone"
                   [attr.maxlength]="mobileNumberLength" [placeholder]="'Enter ' + mobileNumberLength + '-digit mobile number'"
                   autocomplete="tel">
            @if (invalid('phone')) { <small class="text-danger">{{ mobileNumberError }}</small> }
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label" for="userPassword">Temporary password <span class="text-danger">*</span></label>
            <input id="userPassword" class="form-control" type="password" formControlName="password"
                   autocomplete="new-password" placeholder="At least 8 characters">
            @if (invalid('password')) {
              <small class="text-danger">
                @if (form.controls.password.hasError('required')) { Enter a temporary password. }
                @else { Password must be at least 8 characters. }
              </small>
            }
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label" for="userRole">Role <span class="text-danger">*</span></label>
            <select id="userRole" class="form-select" formControlName="role">
              <option value="">Select role</option>
              <option value="ROLE_ADMIN">Administrator</option>
              <option value="ROLE_PATHOLOGIST">Pathologist</option>
              <option value="ROLE_LAB_TECHNICIAN">Lab technician</option>
              <option value="ROLE_RECEPTIONIST">Receptionist</option>
            </select>
            @if (invalid('role')) { <small class="text-danger">Select a role.</small> }
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label" for="userBranchId">Branch ID <span class="text-danger">*</span></label>
            <input id="userBranchId" class="form-control" type="number" min="1" formControlName="branchId"
                   placeholder="Enter the branch ID">
            @if (invalid('branchId')) {
              <small class="text-danger">
                @if (form.controls.branchId.hasError('required') || form.controls.branchId.hasError('min')) {
                  Enter a branch ID greater than zero.
                } @else if (form.controls.branchId.hasError('pattern')) {
                  Enter a whole-number branch ID.
                }
              </small>
            }
          </div>
          <div class="col-12">
            <label class="form-check">
              <input class="form-check-input" type="checkbox" formControlName="isActive">
              <span class="form-check-label">Active user</span>
            </label>
          </div>
          <div class="col-12 d-flex flex-wrap gap-2">
            <button class="btn btn-primary" type="submit" [disabled]="saving">
              {{ saving ? 'Saving...' : 'Save user' }}
            </button>
            <button class="btn btn-outline-secondary" type="button" (click)="reset()">Reset</button>
          </div>
        </div>
      </form>
      </div>
    </section>
  `,
  styleUrls: ['./management-form.scss'],
})
export class UserManagementComponent {
  private readonly fb = inject(FormBuilder);
  private readonly management = inject(ManagementService);
  private readonly toast = inject(ToastService);
  @ViewChild('userForm') private userForm?: ElementRef<HTMLFormElement>;

  protected saving = false;
  protected error = '';
  protected readonly mobileNumberLength = MOBILE_NUMBER_LENGTH;
  protected readonly mobileNumberError = MOBILE_NUMBER_ERROR;
  protected form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(120)]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', mobileNumberValidators()],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['', Validators.required],
    branchId: [0, [Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/)]],
    isActive: [true],
  });

  protected invalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  protected save(): void {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }
    if (this.saving) return;

    this.saving = true;
    this.management.createUser(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.saving = false;
        this.toast.showSuccess(getApiSuccessMessage(response, 'User created successfully.'));
        this.form.reset({ role: '', branchId: 0, isActive: true });
      },
      error: (error: HttpErrorResponse) => {
        this.saving = false;
        this.error = getApiErrorMessage(error, 'Unable to save the user. Please try again.');
      },
    });
  }

  protected reset(): void {
    this.form.reset({ role: '', branchId: 0, isActive: true });
    this.error = '';
  }

  private focusFirstInvalid(): void {
    const fields = this.userForm?.nativeElement.querySelectorAll<HTMLElement>('[formControlName]');
    const field = Array.from(fields ?? []).find((element) => {
      const name = element.getAttribute('formControlName');
      return name !== null && this.form.get(name)?.invalid;
    });
    field?.focus();
  }
}
