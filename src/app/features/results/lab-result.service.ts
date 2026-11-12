import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api/api.config';

export interface LabResult {
  id: number;
  orderId: number;
  orderNumber?: string;
  orderItemId: number;
  testName?: string;
  sampleCollectionId?: number;
  sampleCode?: string;
  testParameterId: number;
  parameterCode?: string;
  parameterName: string;
  resultValue: string;
  unit: string;
  remarks?: string;
  enteredBy?: string;
  resultStatus?: string;
}

export interface CreateLabResultRequest {
  orderItemId: number;
  testParameterId: number;
  resultValue: string;
  unit: string;
  remarks: string;
  enteredBy: string;
}

@Injectable({ providedIn: 'root' })
export class LabResultService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/api/lab-results`;

  getResults(): Observable<unknown> {
    return this.http.get<unknown>(this.endpoint);
  }

  getResultsForOrder(orderId: number): Observable<unknown> {
    return this.http.get<unknown>(`${this.endpoint}/order/${orderId}`);
  }

  getResultsForOrderItem(orderItemId: number): Observable<unknown> {
    return this.http.get<unknown>(`${this.endpoint}/order-item/${orderItemId}`);
  }

  createResult(request: CreateLabResultRequest): Observable<LabResult> {
    return this.http.post<LabResult>(this.endpoint, request);
  }
}
