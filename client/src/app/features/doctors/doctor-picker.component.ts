import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { getApiErrorMessage } from '../../core/api/api-error';
import { ToastService } from '../../core/api/toast.service';
import { Doctor, DoctorService, DoctorSearchResponse } from './doctor.service';
import { DoctorFormComponent } from './doctor-form.component';

export type DoctorSelection = Doctor | 'SELF' | null;

@Component({
  selector: 'app-doctor-picker',
  standalone: true,
  imports: [FormsModule, DoctorFormComponent],
  template: `
    <div class="doctor-picker">
      <label class="picker-label" for="doctorSearch">Referring doctor <span>(optional)</span></label>
      <div class="picker-search">
        <span class="material-icons" aria-hidden="true">search</span>
        <input id="doctorSearch" type="search" class="form-control" [ngModel]="search"
               [ngModelOptions]="{ standalone: true }"
               (ngModelChange)="onSearchChange($event)"
               placeholder="Search doctor by name, registration or hospital"
               autocomplete="off">
      </div>

      <div class="picker-options" role="listbox" aria-label="Referring doctor options">
        <button type="button" class="picker-option self-option"
                [class.selected]="value === null" [attr.aria-selected]="value === null"
                role="option" (click)="selectNone()">
          No referring doctor
        </button>
        <button type="button" class="picker-option self-option"
                [class.selected]="value === 'SELF'" [attr.aria-selected]="value === 'SELF'"
                role="option" (click)="selectSelf()">
          Self / Walk-in
        </button>
        @for (doctor of doctors; track doctor.id) {
          <button type="button" class="picker-option" role="option"
                  [attr.aria-selected]="isSelected(doctor)"
                  [class.selected]="isSelected(doctor)" (click)="selectDoctor(doctor)">
            <span class="doctor-name">{{ doctor.doctorName }}</span>
            <span class="doctor-detail">
              {{ doctor.registrationNumber }}@if (doctor.hospitalName) { · {{ doctor.hospitalName }} }
            </span>
          </button>
        } @empty {
          @if (!loading && !error) { <p class="empty-message">No active doctors found.</p> }
        }
        @if (loading) { <p class="empty-message">Searching doctors...</p> }
        @if (error) { <p class="picker-error" role="alert">{{ error }}</p> }
      </div>

      <button type="button" class="quick-add" (click)="addingDoctor = true">
        <span class="material-icons" aria-hidden="true">person_add</span>
        Add a new doctor
      </button>
    </div>

    @if (addingDoctor) {
      <div class="modal-backdrop" (click)="addingDoctor = false">
        <section class="editor-modal" role="dialog" aria-modal="true" aria-label="Quick-add doctor"
                 (click)="$event.stopPropagation()">
          <header class="modal-header">
            <h2>Add doctor</h2>
            <button type="button" class="close-button" aria-label="Close" (click)="addingDoctor = false">×</button>
          </header>
          <div class="modal-body">
            <app-doctor-form (saved)="onDoctorAdded($event)" (cancelled)="addingDoctor = false" />
          </div>
        </section>
      </div>
    }
  `,
  styleUrls: ['./doctor-picker.component.scss'],
})
export class DoctorPickerComponent implements OnInit, OnDestroy {
  @Input() value: DoctorSelection = null;
  @Output() valueChange = new EventEmitter<DoctorSelection>();

  private readonly doctorService = inject(DoctorService);
  private readonly toast = inject(ToastService);
  private readonly searchChanges = new Subject<string>();
  protected search = '';
  protected doctors: Doctor[] = [];
  protected loading = false;
  protected error = '';
  protected addingDoctor = false;

  ngOnInit(): void {
    this.searchChanges.pipe(debounceTime(250), distinctUntilChanged()).subscribe(() => this.loadDoctors());
    this.loadDoctors();
  }

  ngOnDestroy(): void {
    this.searchChanges.complete();
  }

  protected onSearchChange(value: string): void {
    this.search = value;
    this.searchChanges.next(value);
  }

  protected isSelected(doctor: Doctor): boolean {
    return typeof this.value === 'object' && this.value !== null && this.value.id === doctor.id;
  }

  protected selectSelf(): void {
    this.value = 'SELF';
    this.valueChange.emit(this.value);
  }

  protected selectNone(): void {
    this.value = null;
    this.valueChange.emit(null);
  }

  protected selectDoctor(doctor: Doctor): void {
    this.value = doctor;
    this.valueChange.emit(doctor);
  }

  protected onDoctorAdded(result: { doctor: Doctor; message: string }): void {
    this.addingDoctor = false;
    this.toast.showSuccess(result.message);
    const doctor = result.doctor;
    this.doctors = [doctor, ...this.doctors.filter((item) => item.id !== doctor.id)];
    this.selectDoctor(doctor);
  }

  private loadDoctors(): void {
    this.loading = true;
    this.error = '';
    this.doctorService.searchByName(this.search.trim()).subscribe({
      next: (response) => {
        this.doctors = this.toDoctors(response);
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.error = getApiErrorMessage(error, 'Unable to search doctors. Please try again.');
      },
    });
  }

  private toDoctors(response: DoctorSearchResponse): Doctor[] {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    return 'content' in response ? response.content : [response];
  }
}
