import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { getApiErrorMessage, getApiSuccessMessage } from '../../core/api/api-error';
import { ToastService } from '../../core/api/toast.service';
import { MOBILE_NUMBER_ERROR, MOBILE_NUMBER_LENGTH, mobileNumberValidators } from '../../core/validation/mobile-number';
import { ManagementService } from './management.service';

@Component({
  selector: 'app-branch-management',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="management-card">
      <header class="management-header">
        <span class="material-icons" aria-hidden="true">apartment</span>
        <h1>Branch Management</h1>
      </header>
      <div class="management-body">
      <form #branchForm [formGroup]="form" (ngSubmit)="save()" novalidate>
        @if (error) { <div class="alert alert-danger" role="alert">{{ error }}</div> }

        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label" for="branchCode">Branch code <span class="text-danger">*</span></label>
            <input id="branchCode" class="form-control" formControlName="branchCode" maxlength="20"
                   placeholder="e.g. CHN-001">
            @if (invalid('branchCode')) {
              <small class="text-danger">
                @if (form.controls.branchCode.hasError('required')) { Enter a branch code. }
                @else { Branch code must be 20 characters or fewer. }
              </small>
            }
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label" for="branchName">Branch name <span class="text-danger">*</span></label>
            <input id="branchName" class="form-control" formControlName="branchName" maxlength="100"
                   placeholder="Enter branch name">
            @if (invalid('branchName')) {
              <small class="text-danger">
                @if (form.controls.branchName.hasError('required')) { Enter a branch name. }
                @else { Branch name must be 100 characters or fewer. }
              </small>
            }
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label" for="branchType">Branch type <span class="text-danger">*</span></label>
            <input id="branchType" class="form-control" value="CENTRAL" readonly>
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label" for="branchPhone">Phone</label>
            <input id="branchPhone" class="form-control" type="tel" formControlName="phone"
                   [attr.maxlength]="mobileNumberLength" [placeholder]="'Enter ' + mobileNumberLength + '-digit mobile number'"
                   autocomplete="tel">
            @if (invalid('phone')) { <small class="text-danger">{{ mobileNumberError }}</small> }
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label" for="branchEmail">Email</label>
            <input id="branchEmail" class="form-control" type="email" formControlName="email"
                   placeholder="branch@example.com">
            @if (invalid('email')) { <small class="text-danger">Enter a valid email address.</small> }
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label" for="branchAddress1">Address line 1 <span class="text-danger">*</span></label>
            <input id="branchAddress1" class="form-control" formControlName="addressLine1" maxlength="150"
                   placeholder="Street address">
            @if (invalid('addressLine1')) {
              <small class="text-danger">
                @if (form.controls.addressLine1.hasError('required')) { Enter the branch address. }
                @else { Address must be 150 characters or fewer. }
              </small>
            }
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label" for="branchAddress2">Address line 2</label>
            <input id="branchAddress2" class="form-control" formControlName="addressLine2" maxlength="150"
                   placeholder="Suite, floor, etc. (optional)">
          </div>
          <div class="col-12 col-md-4">
            <label class="form-label" for="branchCity">City <span class="text-danger">*</span></label>
            <input id="branchCity" class="form-control" formControlName="city" maxlength="100" placeholder="Enter city">
            @if (invalid('city')) {
              <small class="text-danger">
                @if (form.controls.city.hasError('required')) { Enter a city. }
                @else { City must be 100 characters or fewer. }
              </small>
            }
          </div>
          <div class="col-12 col-md-4">
            <label class="form-label" for="branchState">State <span class="text-danger">*</span></label>
            <input id="branchState" class="form-control" formControlName="state" maxlength="100" placeholder="Enter state">
            @if (invalid('state')) {
              <small class="text-danger">
                @if (form.controls.state.hasError('required')) { Enter a state. }
                @else { State must be 100 characters or fewer. }
              </small>
            }
          </div>
          <div class="col-12 col-md-4">
            <label class="form-label" for="branchPincode">Pincode <span class="text-danger">*</span></label>
            <input id="branchPincode" class="form-control" formControlName="pincode" inputmode="numeric" maxlength="6"
                   placeholder="6-digit pincode">
            @if (invalid('pincode')) {
              <small class="text-danger">
                @if (form.controls.pincode.hasError('required')) { Enter a pincode. }
                @else { Pincode must contain exactly 6 digits. }
              </small>
            }
          </div>
          <div class="col-12">
            <label class="form-check">
              <input class="form-check-input" type="checkbox" formControlName="isActive">
              <span class="form-check-label">Active branch</span>
            </label>
          </div>
          <div class="col-12 d-flex flex-wrap gap-2">
            <button class="btn btn-primary" type="submit" [disabled]="saving">
              {{ saving ? 'Saving...' : 'Save branch' }}
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
export class BranchManagementComponent {
  private readonly fb = inject(FormBuilder);
  private readonly management = inject(ManagementService);
  private readonly toast = inject(ToastService);
  @ViewChild('branchForm') private branchForm?: ElementRef<HTMLFormElement>;

  protected saving = false;
  protected error = '';
  protected readonly mobileNumberLength = MOBILE_NUMBER_LENGTH;
  protected readonly mobileNumberError = MOBILE_NUMBER_ERROR;
  protected form = this.fb.nonNullable.group({
    branchCode: ['', [Validators.required, Validators.maxLength(20)]],
    branchName: ['', [Validators.required, Validators.maxLength(100)]],
    phone: ['', mobileNumberValidators()],
    email: ['', Validators.email],
    addressLine1: ['', [Validators.required, Validators.maxLength(150)]],
    addressLine2: ['', Validators.maxLength(150)],
    city: ['', [Validators.required, Validators.maxLength(100)]],
    state: ['', [Validators.required, Validators.maxLength(100)]],
    pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
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
    this.management.createBranch(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.saving = false;
        this.toast.showSuccess(getApiSuccessMessage(response, 'Branch created successfully.'));
        this.form.reset({ isActive: true });
      },
      error: (error: HttpErrorResponse) => {
        this.saving = false;
        this.error = getApiErrorMessage(error, 'Unable to save the branch. Please try again.');
      },
    });
  }

  protected reset(): void {
    this.form.reset({ isActive: true });
    this.error = '';
  }

  private focusFirstInvalid(): void {
    const fields = this.branchForm?.nativeElement.querySelectorAll<HTMLElement>('[formControlName]');
    const field = Array.from(fields ?? []).find((element) => {
      const name = element.getAttribute('formControlName');
      return name !== null && this.form.get(name)?.invalid;
    });
    field?.focus();
  }
}
