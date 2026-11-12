import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api/api.config';

export interface PatientOption {
  id: number;
  patientNumber: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
}

export interface TestOption {
  id: number;
  testCode: string;
  testName: string;
  specimenName: string | null;
  price: number;
  categoryName: string;
  turnaroundTime: number;
}

export interface TestOrderRequest {
  patientId: number;
  doctorId?: number;
  priority: 'NORMAL' | 'URGENT' | 'STAT';
  discountAmount: number;
  notes: string;
  testIds: number[];
}

export interface PageResponse<T> {
  content: T[];
}

@Injectable({ providedIn: 'root' })
export class TestOrderService {
  private readonly http = inject(HttpClient);

  searchPatients(query: string): Observable<PageResponse<PatientOption> | PatientOption[]> {
    const params = new HttpParams().set('name', query);
    return this.http.get<PageResponse<PatientOption> | PatientOption[]>(
      `${API_BASE_URL}/api/patients/search`,
      { params },
    );
  }

  searchTests(query: string): Observable<PageResponse<TestOption> | TestOption[]> {
    const params = new HttpParams().set('name', query);
    return this.http.get<PageResponse<TestOption> | TestOption[]>(
      `${API_BASE_URL}/api/lab-tests/search`,
      { params },
    );
  }

  createOrder(request: TestOrderRequest): Observable<unknown> {
    return this.http.post<unknown>(`${API_BASE_URL}/api/orders`, request);
  }
}
