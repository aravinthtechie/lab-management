import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api/api.config';

export interface PatientRegistrationRequest {
  patientNumber: string | null;
  branchId: number | null;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  bloodGroup: string | null;
  mobileNumber: string | null;
  alternateMobile: string | null;
  email: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  emergencyContactName: string | null;
  emergencyContactNumber: string | null;
  isActive: boolean | null;
}

@Injectable({ providedIn: 'root' })
export class PatientRegistrationService {
  private readonly http = inject(HttpClient);

  create(request: PatientRegistrationRequest): Observable<string> {
    return this.http.post(`${API_BASE_URL}/api/patients`, request, { responseType: 'text' });
  }
}
