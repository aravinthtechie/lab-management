import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api/api.config';

export interface SampleDispatch {
  id: number;
  dispatchNumber?: string;
  sampleCollectionId: number;
  sampleCode?: string;
  orderId?: number;
  orderItemId?: number;
  testName?: string;
  dispatchedBy?: string;
  destination?: string;
  dispatchDateTime?: string;
  transportCondition?: string;
  dispatchStatus?: string;
  receivedBy?: string | null;
  receivedDateTime?: string | null;
  rejectedBy?: string | null;
  rejectedDateTime?: string | null;
  rejectionReason?: string | null;
  notes?: string;
}

export interface SampleCollectionInfo {
  id: number;
  orderId: number;
  orderItemId: number;
  orderNumber?: string;
  testName?: string;
  specimenName?: string;
  sampleCode?: string;
  collectionStatus?: string;
  collectionDateTime?: string;
  collectedBy?: string;
}

export interface CreateSampleDispatchRequest {
  sampleCollectionId: number;
  dispatchedBy: string;
  destination: string;
  dispatchDateTime: string;
  transportCondition: string;
  notes: string;
}

export interface ReceiveSampleRequest {
  receivedBy: string;
  notes: string;
}

export interface RejectSampleRequest {
  rejectedBy: string;
  rejectionReason: string;
}

@Injectable({ providedIn: 'root' })
export class SampleDispatchService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/api/sample-dispatches`;
  private readonly collectionsEndpoint = `${API_BASE_URL}/api/sample-collections`;

  getDispatches(): Observable<unknown> {
    return this.http.get<unknown>(this.endpoint);
  }

  getDispatch(dispatchId: number): Observable<unknown> {
    return this.http.get<unknown>(`${this.endpoint}/${dispatchId}`);
  }

  getDispatchBySample(sampleId: number): Observable<unknown> {
    return this.http.get<unknown>(`${this.endpoint}/sample/${sampleId}`);
  }

  getCollection(sampleCollectionId: number): Observable<SampleCollectionInfo> {
    return this.http.get<SampleCollectionInfo>(`${this.collectionsEndpoint}/${sampleCollectionId}`);
  }

  createDispatch(request: CreateSampleDispatchRequest): Observable<unknown> {
    return this.http.post<unknown>(this.endpoint, request);
  }

  receiveSample(dispatchId: number, request: ReceiveSampleRequest): Observable<unknown> {
    return this.http.put<unknown>(`${this.endpoint}/${dispatchId}/receive`, request);
  }

  rejectSample(dispatchId: number, request: RejectSampleRequest): Observable<unknown> {
    return this.http.put<unknown>(`${this.endpoint}/${dispatchId}/reject`, request);
  }
}
