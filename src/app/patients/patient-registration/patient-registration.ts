import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { getApiErrorMessage, getApiSuccessMessage } from '../../core/api/api-error';
import { ToastService } from '../../core/api/toast.service';
import { MOBILE_NUMBER_ERROR, MOBILE_NUMBER_LENGTH, mobileNumberValidators } from '../../core/validation/mobile-number';
import { PatientRegistrationService } from './patient-registration.service';

@Component({
  selector: 'app-patient-registration',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './patient-registration.html',
  styleUrls: ['./patient-registration.scss'],
})
export class PatientRegistrationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly patientRegistration = inject(PatientRegistrationService);
  private readonly toast = inject(ToastService);
  @ViewChild('patientForm') private patientForm?: ElementRef<HTMLFormElement>;
  saving = false;
  saveError = '';
  protected readonly mobileNumberLength = MOBILE_NUMBER_LENGTH;
  protected readonly mobileNumberError = MOBILE_NUMBER_ERROR;

  // TODO: replace these static lists with API calls (branches, master data)
  branches = [
    { id: 1, name: 'Main Branch' },
    { id: 2, name: 'Collection Branch 1' },
    { id: 3, name: 'Collection Branch 2' },
  ];
  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  cities = ['Bangalore', 'Chennai', 'Coimbatore', 'Hyderabad'];
  states = ['Karnataka', 'Tamil Nadu', 'Telangana', 'Kerala'];

  form = this.fb.group({
    patientNumber: [{ value: '', disabled: false }, Validators.required],
    branchId: [null as number | null, Validators.required],
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', Validators.maxLength(100)],
    dateOfBirth: ['', Validators.required],
    gender: ['MALE', Validators.required],
    bloodGroup: [''],
    mobileNumber: ['', mobileNumberValidators(true)],
    alternateMobile: ['', mobileNumberValidators()],
    email: ['', Validators.email],
    addressLine1: ['', Validators.required],
    addressLine2: [''],
    city: ['', Validators.required],
    state: ['', Validators.required],
    pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    emergencyContactName: [''],
    emergencyContactNumber: ['', mobileNumberValidators()],
    isActive: [true],
  });

  /** True when a control is invalid and the user has interacted with it. */
  invalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  generatePatientNumber(): void {
    // Placeholder only. In production, generate the number on the server
    // (e.g. PNT + year + running sequence) to avoid duplicates.
    const seq = Math.floor(Math.random() * 9000 + 1000);
    this.form.patchValue({ patientNumber: `PNT${new Date().getFullYear()}${seq}` });
  }

  save(): void {
    this.saveError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const firstInvalidField = Array.from(
        this.patientForm?.nativeElement.querySelectorAll<HTMLElement>('[formControlName]') ?? [],
      ).find((field) => {
        const controlName = field.getAttribute('formControlName');
        return controlName !== null && this.form.get(controlName)?.invalid;
      });
      firstInvalidField?.focus();
      return;
    }
    if (this.saving) return;

    this.saving = true;
    this.patientRegistration.create(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.saving = false;
        this.toast.showSuccess(getApiSuccessMessage(response, 'Patient registered successfully.'));
        this.form.reset({ gender: 'MALE', isActive: true });
      },
      error: (error: HttpErrorResponse) => {
        this.saving = false;
        this.saveError = getApiErrorMessage(
          error,
          error.status
            ? 'Unable to save the patient. Please check the details and try again.'
            : 'Cannot reach the server. Please try again.',
        );
      },
    });
  }

  reset(): void {
    this.form.reset({ gender: 'MALE', isActive: true });
    this.saveError = '';
  }
}
