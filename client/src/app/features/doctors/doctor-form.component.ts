import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { getApiErrorMessage, getApiSuccessMessage } from '../../core/api/api-error';
import { MOBILE_NUMBER_ERROR, MOBILE_NUMBER_LENGTH, mobileNumberValidators } from '../../core/validation/mobile-number';
import { Doctor, DoctorFormData, DoctorService } from './doctor.service';

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form class="doctor-form" [formGroup]="form" (ngSubmit)="save()" novalidate>
      @if (error) { <p class="form-error" role="alert">{{ error }}</p> }

      <div class="row g-3">
        <div class="col-12 col-md-6">
          <label class="form-label" for="doctorName">Doctor name <span class="required">*</span></label>
          <input id="doctorName" class="form-control" formControlName="doctorName" maxlength="120"
                 autocomplete="name" placeholder="Enter doctor's full name">
          @if (invalid('doctorName')) { <small class="field-error">Enter the doctor's name (up to 120 characters).</small> }
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label" for="doctorRegistration">Registration number <span class="required">*</span></label>
          <input id="doctorRegistration" class="form-control" formControlName="registrationNumber"
                 maxlength="50" placeholder="Medical council registration number">
          @if (invalid('registrationNumber')) {
            <small class="field-error">Enter a registration number (up to 50 characters).</small>
          }
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label" for="doctorSpecialization">Specialization</label>
          <input id="doctorSpecialization" class="form-control" formControlName="specialization"
                 maxlength="100" placeholder="e.g. General Medicine">
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label" for="doctorHospital">Hospital / clinic</label>
          <input id="doctorHospital" class="form-control" formControlName="hospitalName"
                 maxlength="150" placeholder="Hospital or clinic name">
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label" for="doctorMobile">Mobile</label>
          <input id="doctorMobile" class="form-control" type="tel" formControlName="mobileNumber"
                 [attr.maxlength]="mobileNumberLength" autocomplete="tel"
                 [placeholder]="'Enter ' + mobileNumberLength + '-digit mobile number'">
          @if (invalid('mobileNumber')) { <small class="field-error">{{ mobileNumberError }}</small> }
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label" for="doctorEmail">Email</label>
          <input id="doctorEmail" class="form-control" type="email" formControlName="email"
                 autocomplete="email" placeholder="name@example.com">
          @if (invalid('email')) { <small class="field-error">Enter a valid email address.</small> }
        </div>
        <div class="col-12">
          <label class="form-check">
            <input class="form-check-input" type="checkbox" formControlName="isActive">
            <span class="form-check-label">Active doctor</span>
          </label>
        </div>
        <div class="col-12 d-flex flex-wrap gap-2">
          <button class="btn btn-primary" type="submit" [disabled]="saving">
            {{ saving ? 'Saving...' : (doctor ? 'Save changes' : 'Add doctor') }}
          </button>
          <button class="btn btn-outline-secondary" type="button" (click)="cancelled.emit()" [disabled]="saving">
            Cancel
          </button>
        </div>
      </div>
    </form>
  `,
  styleUrls: ['./doctor-form.component.scss'],
})
export class DoctorFormComponent {
  @Input() doctor: Doctor | null = null;
  @Output() saved = new EventEmitter<{ doctor: Doctor; message: string }>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly doctors = inject(DoctorService);
  protected saving = false;
  protected error = '';
  protected readonly mobileNumberLength = MOBILE_NUMBER_LENGTH;
  protected readonly mobileNumberError = MOBILE_NUMBER_ERROR;

  protected form = this.fb.nonNullable.group({
    doctorName: ['', [Validators.required, Validators.maxLength(120)]],
    registrationNumber: ['', [Validators.required, Validators.maxLength(50)]],
    specialization: ['', Validators.maxLength(100)],
    hospitalName: ['', Validators.maxLength(150)],
    mobileNumber: ['', mobileNumberValidators()],
    email: ['', Validators.email],
    isActive: [true],
  });

  ngOnInit(): void {
    if (this.doctor) this.form.reset(this.toFormData(this.doctor));
  }

  protected invalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  protected save(): void {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.saving) return;

    this.saving = true;
    const request = this.form.getRawValue();
    const saveRequest = this.doctor
      ? this.doctors.update(this.doctor.id, request)
      : this.doctors.create(request);
    saveRequest.subscribe({
      next: (doctor) => {
        this.saving = false;
        const action = this.doctor ? 'updated' : 'added';
        this.saved.emit({
          doctor,
          message: getApiSuccessMessage(doctor, `Doctor ${action} successfully.`),
        });
      },
      error: (error: HttpErrorResponse) => {
        this.saving = false;
        this.error = getApiErrorMessage(
          error,
          error.status === 409
            ? 'A doctor with this registration number already exists.'
            : 'Unable to save the doctor. Please check the details and try again.',
        );
      },
    });
  }

  private toFormData(doctor: Doctor): DoctorFormData {
    return {
      doctorName: doctor.doctorName,
      registrationNumber: doctor.registrationNumber,
      specialization: doctor.specialization,
      hospitalName: doctor.hospitalName,
      mobileNumber: doctor.mobileNumber,
      email: doctor.email,
      isActive: doctor.isActive,
    };
  }
}
