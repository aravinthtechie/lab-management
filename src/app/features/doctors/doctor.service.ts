import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api/api.config';

export interface Doctor {
  id: number;
  doctorName: string;
  registrationNumber: string;
  specialization: string;
  hospitalName: string;
  mobileNumber: string;
  email: string;
  isActive: boolean;
}

export type DoctorFormData = Omit<Doctor, 'id'>;

export interface DoctorPage {
  content: Doctor[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export type DoctorSearchResponse = Doctor | Doctor[] | DoctorPage | null;

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/api/doctors`;

  list(
    search: string,
    status: 'ALL' | 'ACTIVE' | 'INACTIVE',
    page: number,
    size: number,
  ): Observable<DoctorSearchResponse> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search.trim()) params = params.set('search', search.trim());
    if (status !== 'ALL') params = params.set('status', status);
    return this.http.get<DoctorPage>(this.endpoint, { params });
  }

  searchByName(name: string): Observable<DoctorSearchResponse> {
    const params = new HttpParams().set('name', name);
    return this.http.get<DoctorSearchResponse>(`${this.endpoint}/search`, { params });
  }

  create(doctor: DoctorFormData): Observable<Doctor> {
    return this.http.post<Doctor>(this.endpoint, doctor);
  }

  update(id: number, doctor: DoctorFormData): Observable<Doctor> {
    return this.http.put<Doctor>(`${this.endpoint}/${id}`, doctor);
  }
}
