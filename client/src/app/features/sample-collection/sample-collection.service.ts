import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api/api.config';

export interface SampleCollectionOrderItem {
  id: number;
  labTestId: number;
  testCode: string;
  testName: string;
  itemStatus: string;
  specimenName?: string | null;
}

export interface SampleCollectionPatient {
  id: number;
  patientNumber?: string;
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
}

export interface PendingCollectionOrder {
  id: number;
  orderNumber: string;
  patientId: number;
  patient?: SampleCollectionPatient;
  orderDate?: string;
  priority?: string;
  orderStatus?: string;
  orderItems: SampleCollectionOrderItem[];
}

export interface SampleCollectionRecord {
  id: number;
  orderId: number;
  orderItemId?: number;
  orderNumber?: string;
  collectionDateTime?: string;
  collectedBy?: string;
  specimenCondition?: string;
  notes?: string;
  orderItems?: SampleCollectionOrderItem[];
}

export interface RecordSampleCollectionRequest {
  orderItemId: number;
  collectedBy: string;
  collectionDateTime: string;
  specimenCondition: string;
  notes: string;
}

export interface PageResponse<T> {
  content: T[];
}

@Injectable({ providedIn: 'root' })
export class SampleCollectionService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/api/sample-collections`;
  private readonly ordersEndpoint = `${API_BASE_URL}/api/orders`;

  getOrders(): Observable<unknown> {
    return this.http.get<unknown>(this.ordersEndpoint);
  }

  getOrderDetails(orderId: number): Observable<unknown> {
    return this.http.get<unknown>(`${this.ordersEndpoint}/${orderId}`);
  }

  getCollection(collectionId: number): Observable<SampleCollectionRecord> {
    return this.http.get<SampleCollectionRecord>(`${this.endpoint}/${collectionId}`);
  }

  recordCollection(request: RecordSampleCollectionRequest): Observable<unknown> {
    return this.http.post<unknown>(this.endpoint, request);
  }
}
