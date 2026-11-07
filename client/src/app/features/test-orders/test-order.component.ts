import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { getApiErrorMessage, getApiSuccessMessage } from '../../core/api/api-error';
import { ToastService } from '../../core/api/toast.service';
import { DoctorPickerComponent, DoctorSelection } from '../doctors/doctor-picker.component';
import {
  PageResponse,
  PatientOption,
  TestOption,
  TestOrderRequest,
  TestOrderService,
} from './test-order.service';

@Component({
  selector: 'app-test-order',
  standalone: true,
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink, DoctorPickerComponent],
  template: `
    <section class="order-card">
      <header class="order-header">
        <span class="material-icons" aria-hidden="true">assignment</span>
        <h1>New Test Order</h1>
      </header>

      <form class="order-body" [formGroup]="form" (ngSubmit)="createOrder()" novalidate>
        @if (error) { <p class="form-error" role="alert">{{ error }}</p> }
        @if (orderCreated) {
          <p class="order-success" role="status">
            Order created successfully with {{ orderItems.length }} test{{ orderItems.length === 1 ? '' : 's' }}.
          </p>
        }

        <fieldset class="order-fields" [disabled]="orderCreated">
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label" for="patientSearch">Patient <span class="required">*</span></label>
            <div class="search-wrap">
              <span class="material-icons" aria-hidden="true">search</span>
              <input id="patientSearch" class="form-control search-input" type="search"
                     [value]="patientQuery" (input)="onPatientQuery($event)"
                     placeholder="Search by name, number or mobile" autocomplete="off">
            </div>
            @if (selectedPatient) {
              <div class="selected-patient">
                <span>
                  <strong>{{ selectedPatient.firstName }} {{ selectedPatient.lastName }}</strong>
                  <small>{{ selectedPatient.patientNumber }} · {{ selectedPatient.mobileNumber }}</small>
                </span>
                <button type="button" class="clear-button" (click)="clearPatient()" aria-label="Clear selected patient">×</button>
              </div>
            } @else if (patientQuery.trim()) {
              <div class="search-results" role="listbox" aria-label="Patient search results">
                @for (patient of patients; track patient.id) {
                  <button type="button" role="option" class="result-option" (click)="selectPatient(patient)">
                    <strong>{{ patient.firstName }} {{ patient.lastName }}</strong>
                    <small>{{ patient.patientNumber }} · {{ patient.mobileNumber }}</small>
                  </button>
                } @empty {
                  @if (!searchingPatients && !patientSearchError) {
                    <p class="empty-result">No matching patients found.</p>
                  }
                }
                @if (searchingPatients) { <p class="empty-result">Searching patients...</p> }
                @if (patientSearchError) { <p class="field-error" role="alert">{{ patientSearchError }}</p> }
              </div>
            }
            @if (patientSelectionError) { <small class="field-error">{{ patientSelectionError }}</small> }
          </div>

          <div class="col-12 col-md-6 doctor-field">
            <app-doctor-picker [(value)]="doctor" />
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label" for="priority">Priority <span class="required">*</span></label>
            <select id="priority" class="form-select" formControlName="priority">
              <option value="NORMAL">Normal</option>
              <option value="URGENT">Urgent</option>
              <option value="STAT">STAT</option>
            </select>
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label" for="discountAmount">Discount amount</label>
            <input id="discountAmount" class="form-control" type="number" min="0" step="0.01"
                   formControlName="discountAmount" placeholder="0.00">
            @if (form.controls.discountAmount.invalid && form.controls.discountAmount.touched) {
              <small class="field-error">Enter a discount amount of zero or more.</small>
            }
          </div>
          <div class="col-12">
            <label class="form-label" for="orderNotes">Notes</label>
            <textarea id="orderNotes" class="form-control notes-control" formControlName="notes"
                      rows="3" maxlength="500" placeholder="Optional notes for this order"></textarea>
          </div>
        </div>

        <section class="tests-section" aria-labelledby="testsHeading">
          <div class="section-title">
            <h2 id="testsHeading">Tests / Profiles</h2>
            <span>{{ orderItems.length }} selected</span>
          </div>

          <label class="form-label" for="testSearch">Add a test or profile</label>
          <div class="search-wrap">
            <span class="material-icons" aria-hidden="true">search</span>
            <input id="testSearch" class="form-control search-input" type="search"
                   [value]="testQuery" (input)="onTestQuery($event)"
                   placeholder="Search test code or name" autocomplete="off">
          </div>
          @if (testQuery.trim()) {
            <div class="search-results test-results" role="listbox" aria-label="Test search results">
              @for (test of tests; track test.id) {
                <button type="button" role="option" class="result-option"
                        [disabled]="isAdded(test)"
                        (click)="addTest(test)">
                  <span><strong>{{ test.testName }}</strong><small>{{ test.testCode }}</small></span>
                  <span>{{ isAdded(test) ? 'Added' : (test.price | currency:'INR':'symbol-narrow':'1.2-2') }}</span>
                </button>
              } @empty {
                @if (!searchingTests && !testSearchError) {
                  <p class="empty-result">No matching tests found.</p>
                }
              }
              @if (searchingTests) { <p class="empty-result">Searching tests...</p> }
              @if (testSearchError) { <p class="field-error" role="alert">{{ testSearchError }}</p> }
            </div>
          }

          @if (itemsError) { <p class="field-error">{{ itemsError }}</p> }
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Test / Profile</th>
                  <th scope="col">Specimen</th>
                  <th scope="col">Price</th>
                  <th scope="col"><span class="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                @for (test of orderItems; track test.id) {
                  <tr>
                    <td><strong>{{ test.testName }}</strong><small>{{ test.testCode }}</small></td>
                    <td>{{ test.specimenName || '—' }}</td>
                    <td>{{ test.price | currency:'INR':'symbol-narrow':'1.2-2' }}</td>
                    <td>
                      <button type="button" class="remove-button" (click)="removeTest(test)"
                              [attr.aria-label]="'Remove ' + test.testName">Remove</button>
                    </td>
                  </tr>
                } @empty {
                  <tr><td class="empty-tests" colspan="4">Search and add one or more tests to this order.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </section>
        </fieldset>

        <div class="form-actions">
          @if (orderCreated) {
            <button type="button" class="btn btn-primary" (click)="startAnotherOrder()">
              <span class="material-icons" aria-hidden="true">add</span>
              Create another order
            </button>
          } @else {
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              <span class="material-icons" aria-hidden="true">receipt_long</span>
              {{ saving ? 'Creating order...' : 'Create Order & Invoice' }}
            </button>
          }
          <button type="button" class="btn btn-outline-secondary" routerLink="/dashboard" [disabled]="saving">
            Cancel
          </button>
        </div>
      </form>
    </section>
  `,
  styleUrls: ['./test-order.component.scss'],
})
export class TestOrderComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly orders = inject(TestOrderService);
  private readonly toast = inject(ToastService);
  private readonly patientQueries = new Subject<string>();
  private readonly testQueries = new Subject<string>();

  protected readonly form = this.fb.group({
    priority: this.fb.nonNullable.control<'NORMAL' | 'URGENT' | 'STAT'>('NORMAL', Validators.required),
    discountAmount: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0)]),
    notes: this.fb.nonNullable.control(''),
  });
  protected doctor: DoctorSelection = null;
  protected patients: PatientOption[] = [];
  protected tests: TestOption[] = [];
  protected orderItems: TestOption[] = [];
  protected selectedPatient: PatientOption | null = null;
  protected patientQuery = '';
  protected testQuery = '';
  protected searchingPatients = false;
  protected searchingTests = false;
  protected saving = false;
  protected orderCreated = false;
  protected error = '';
  protected patientSearchError = '';
  protected testSearchError = '';
  protected patientSelectionError = '';
  protected itemsError = '';

  ngOnInit(): void {
    this.patientQueries.pipe(debounceTime(250), distinctUntilChanged()).subscribe((query) => {
      if (query.trim()) this.searchPatients(query.trim());
      else this.patients = [];
    });
    this.testQueries.pipe(debounceTime(250), distinctUntilChanged()).subscribe((query) => {
      if (query.trim()) this.searchTests(query.trim());
      else this.tests = [];
    });
  }

  ngOnDestroy(): void {
    this.patientQueries.complete();
    this.testQueries.complete();
  }

  protected onPatientQuery(event: Event): void {
    this.patientQuery = (event.target as HTMLInputElement).value;
    this.selectedPatient = null;
    this.patientSelectionError = '';
    this.patientQueries.next(this.patientQuery);
  }

  protected onTestQuery(event: Event): void {
    this.testQuery = (event.target as HTMLInputElement).value;
    this.testQueries.next(this.testQuery);
  }

  protected selectPatient(patient: PatientOption): void {
    this.selectedPatient = patient;
    this.patientQuery = '';
    this.patients = [];
    this.patientSelectionError = '';
  }

  protected clearPatient(): void {
    this.selectedPatient = null;
  }

  protected addTest(test: TestOption): void {
    this.itemsError = '';
    if (this.isAdded(test)) return;
    this.orderItems = [...this.orderItems, test];
    this.testQuery = '';
    this.tests = [];
  }

  protected removeTest(test: TestOption): void {
    this.orderItems = this.orderItems.filter((item) => item.id !== test.id);
  }

  protected isAdded(test: TestOption): boolean {
    return this.orderItems.some((item) => item.id === test.id);
  }

  protected createOrder(): void {
    this.error = '';
    this.patientSelectionError = '';
    this.itemsError = '';
    this.form.markAllAsTouched();

    if (!this.selectedPatient) this.patientSelectionError = 'Search for and select a patient.';
    if (!this.orderItems.length) this.itemsError = 'Add at least one test or profile.';
    if (!this.selectedPatient || !this.orderItems.length || this.form.invalid || this.saving || this.orderCreated) return;

    const request: TestOrderRequest = {
      patientId: this.selectedPatient.id,
      priority: this.form.controls.priority.value,
      discountAmount: this.form.controls.discountAmount.value,
      notes: this.form.controls.notes.value.trim(),
      testIds: this.orderItems.map(({ id }) => id),
    };
    if (typeof this.doctor === 'object' && this.doctor) request.doctorId = this.doctor.id;

    this.saving = true;
    this.orders.createOrder(request).subscribe({
      next: (response) => {
        this.saving = false;
        this.toast.showSuccess(getApiSuccessMessage(response, 'Test order and invoice created successfully.'));
        this.orderCreated = true;
      },
      error: (error: HttpErrorResponse) => {
        this.saving = false;
        this.error = getApiErrorMessage(
          error,
          'Unable to create the order. Please check the details and try again.',
        );
      },
    });
  }

  private searchPatients(query: string): void {
    this.searchingPatients = true;
    this.patientSearchError = '';
    this.orders.searchPatients(query).subscribe({
      next: (response) => {
        this.patients = this.toItems(response);
        this.searchingPatients = false;
      },
      error: (error: HttpErrorResponse) => {
        this.searchingPatients = false;
        this.patientSearchError = getApiErrorMessage(error, 'Unable to search patients. Please try again.');
      },
    });
  }

  private searchTests(query: string): void {
    this.searchingTests = true;
    this.testSearchError = '';
    this.orders.searchTests(query).subscribe({
      next: (response) => {
        this.tests = this.toItems(response);
        this.searchingTests = false;
      },
      error: (error: HttpErrorResponse) => {
        this.searchingTests = false;
        this.testSearchError = getApiErrorMessage(error, 'Unable to search tests. Please try again.');
      },
    });
  }

  private toItems<T>(response: PageResponse<T> | T[]): T[] {
    return Array.isArray(response) ? response : response.content;
  }

  protected startAnotherOrder(): void {
    this.reset();
  }

  private reset(): void {
    this.form.reset({ priority: 'NORMAL', discountAmount: 0, notes: '' });
    this.selectedPatient = null;
    this.patientQuery = '';
    this.testQuery = '';
    this.doctor = null;
    this.orderItems = [];
    this.patients = [];
    this.tests = [];
    this.orderCreated = false;
  }
}
