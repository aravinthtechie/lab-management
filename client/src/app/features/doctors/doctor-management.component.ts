import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { getApiErrorMessage } from '../../core/api/api-error';
import { ToastService } from '../../core/api/toast.service';
import { Doctor, DoctorPage, DoctorSearchResponse, DoctorService } from './doctor.service';
import { DoctorFormComponent } from './doctor-form.component';

@Component({
  selector: 'app-doctor-management',
  standalone: true,
  imports: [FormsModule, DoctorFormComponent],
  template: `
    <section class="doctor-card">
      <header class="doctor-header">
        <span class="material-icons" aria-hidden="true">medical_services</span>
        <h1>Doctor Management</h1>
      </header>

      <div class="doctor-body">
        <div class="toolbar">
          <label class="search-field">
            <span class="material-icons" aria-hidden="true">search</span>
            <input type="search" class="form-control" [ngModel]="search"
                   (ngModelChange)="onSearchChange($event)"
                   placeholder="Search name, registration number or hospital"
                   aria-label="Search doctors">
          </label>
          <label class="status-field">
            <span>Status</span>
            <select class="form-select" [ngModel]="status" (ngModelChange)="onStatusChange($event)"
                    aria-label="Filter doctors by status">
              <option value="ALL">All doctors</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>
          <button type="button" class="btn btn-primary add-button" (click)="openAdd()">
            <span class="material-icons" aria-hidden="true">add</span>Add doctor
          </button>
        </div>

        @if (error) { <p class="doctor-error" role="alert">{{ error }}</p> }

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Doctor</th>
                <th scope="col">Registration number</th>
                <th scope="col">Specialization</th>
                <th scope="col">Hospital / clinic</th>
                <th scope="col">Contact</th>
                <th scope="col">Status</th>
                <th scope="col"><span class="visually-hidden">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              @for (doctor of doctors; track doctor.id) {
                <tr>
                  <td><strong>{{ doctor.doctorName }}</strong></td>
                  <td>{{ doctor.registrationNumber }}</td>
                  <td>{{ doctor.specialization || '—' }}</td>
                  <td>{{ doctor.hospitalName || '—' }}</td>
                  <td>
                    @if (doctor.mobileNumber) { <span class="contact-line">{{ doctor.mobileNumber }}</span> }
                    @if (doctor.email) { <span class="contact-line">{{ doctor.email }}</span> }
                    @if (!doctor.mobileNumber && !doctor.email) { <span>—</span> }
                  </td>
                  <td>
                    <span class="status" [class.active]="doctor.isActive" [class.inactive]="!doctor.isActive">
                      {{ doctor.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>
                    <button class="edit-button" type="button" (click)="openEdit(doctor)"
                            [attr.aria-label]="'Edit ' + doctor.doctorName">
                      <span class="material-icons" aria-hidden="true">edit</span>Edit
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td class="empty-state" colspan="7">
                    @if (loading) { Loading doctors... }
                    @else if (error) { Doctors could not be loaded. }
                    @else { No doctors match your search. }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <footer class="pagination">
          <span>
            @if (page.totalElements) {
              Showing {{ page.number * page.size + 1 }}–{{ page.number * page.size + doctors.length }}
              of {{ page.totalElements }} doctors
            } @else { No doctors }
          </span>
          <div class="page-actions">
            <button type="button" class="page-button" (click)="changePage(page.number - 1)"
                    [disabled]="loading || page.number <= 0" aria-label="Previous page">Previous</button>
            <span>Page {{ page.totalPages ? page.number + 1 : 0 }} of {{ page.totalPages }}</span>
            <button type="button" class="page-button" (click)="changePage(page.number + 1)"
                    [disabled]="loading || page.number + 1 >= page.totalPages"
                    aria-label="Next page">Next</button>
          </div>
        </footer>
      </div>
    </section>

    @if (editing !== undefined) {
      <div class="modal-backdrop" (click)="closeEditor()">
        <section class="editor-modal" role="dialog" aria-modal="true"
                 [attr.aria-label]="editing ? 'Edit doctor' : 'Add doctor'"
                 (click)="$event.stopPropagation()">
          <header class="modal-header">
            <h2>{{ editing ? 'Edit doctor' : 'Add doctor' }}</h2>
            <button type="button" class="close-button" aria-label="Close" (click)="closeEditor()">×</button>
          </header>
          <div class="modal-body">
            <app-doctor-form [doctor]="editing" (saved)="onSaved($event)" (cancelled)="closeEditor()" />
          </div>
        </section>
      </div>
    }
  `,
  styleUrls: ['./doctor-management.component.scss'],
})
export class DoctorManagementComponent implements OnInit, OnDestroy {
  private readonly doctorService = inject(DoctorService);
  private readonly toast = inject(ToastService);
  private readonly searchChanges = new Subject<string>();
  protected search = '';
  protected status: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';
  protected doctors: Doctor[] = [];
  protected page: DoctorPage = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 };
  protected loading = false;
  protected error = '';
  protected editing: Doctor | null | undefined;

  ngOnInit(): void {
    this.searchChanges.pipe(debounceTime(250), distinctUntilChanged()).subscribe(() => {
      this.page = { ...this.page, number: 0 };
      this.loadDoctors();
    });
    this.loadDoctors();
  }

  ngOnDestroy(): void {
    this.searchChanges.complete();
  }

  protected onSearchChange(value: string): void {
    this.search = value;
    this.searchChanges.next(value);
  }

  protected onStatusChange(value: 'ALL' | 'ACTIVE' | 'INACTIVE'): void {
    this.status = value;
    this.page = { ...this.page, number: 0 };
    this.loadDoctors();
  }

  protected changePage(pageNumber: number): void {
    if (pageNumber < 0 || pageNumber >= this.page.totalPages || this.loading) return;
    this.page = { ...this.page, number: pageNumber };
    this.loadDoctors();
  }

  protected openAdd(): void {
    this.editing = null;
  }

  protected openEdit(doctor: Doctor): void {
    this.editing = doctor;
  }

  protected closeEditor(): void {
    this.editing = undefined;
  }

  protected onSaved(result: { doctor: Doctor; message: string }): void {
    this.closeEditor();
    this.toast.showSuccess(result.message);
    this.loadDoctors();
  }

  private loadDoctors(): void {
    this.loading = true;
    this.error = '';
    const search = this.search.trim();
    const request = search
      ? this.doctorService.searchByName(search)
      : this.doctorService.list('', this.status, this.page.number, this.page.size);
    request.subscribe({
      next: (result) => {
        if (!search && result && !Array.isArray(result) && 'content' in result) {
          this.page = result;
          this.doctors = result.content;
        } else {
          let doctors = this.toDoctors(result);
          if (this.status === 'ACTIVE') doctors = doctors.filter((doctor) => doctor.isActive);
          if (this.status === 'INACTIVE') doctors = doctors.filter((doctor) => !doctor.isActive);
          const start = this.page.number * this.page.size;
          this.doctors = doctors.slice(start, start + this.page.size);
          this.page = {
            content: this.doctors,
            totalElements: doctors.length,
            totalPages: Math.ceil(doctors.length / this.page.size),
            number: this.page.number,
            size: this.page.size,
          };
        }
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.error = getApiErrorMessage(error, 'Unable to load doctors. Please try again.');
      },
    });
  }

  private toDoctors(response: DoctorSearchResponse): Doctor[] {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    return 'content' in response ? response.content : [response];
  }
}
