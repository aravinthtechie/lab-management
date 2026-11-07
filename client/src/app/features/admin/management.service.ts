import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api/api.config';

export interface BranchRequest {
  organizationId: number;
  branchCode: string;
  branchName: string;
  branchType: 'CENTRAL';
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface BranchFormData {
  branchCode: string;
  branchName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  isActive: boolean;
}

export interface UserRequest {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  branchId: number;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class ManagementService {
  private readonly http = inject(HttpClient);

  createBranch(form: BranchFormData): Observable<string> {
    const request: BranchRequest = {
      organizationId: 1,
      branchCode: form.branchCode,
      branchName: form.branchName,
      branchType: 'CENTRAL',
      phone: form.phone,
      email: form.email,
      address: [form.addressLine1, form.addressLine2].filter(Boolean).join(', '),
      city: form.city,
      state: form.state,
      pincode: form.pincode,
    };
    return this.http.post(`${API_BASE_URL}/api/branches`, request, { responseType: 'text' });
  }

  createUser(request: UserRequest): Observable<string> {
    return this.http.post(`${API_BASE_URL}/api/users`, request, { responseType: 'text' });
  }
}