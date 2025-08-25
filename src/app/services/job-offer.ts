import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobOfferModel } from '../models/job-offer.model';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class JobOfferService {
  private apiUrl = 'http://localhost:8000/api/job-offers/';

  constructor(private http: HttpClient) {}

  getJobOffers(
    page: number = 1,
    perPage: number = 5
  ): Observable<PaginatedResponse<JobOfferModel>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<PaginatedResponse<JobOfferModel>>(this.apiUrl, {
      params,
    });
  }

  getCurrentUserJobs(): Observable<JobOfferModel[]> {
    return this.http.get<JobOfferModel[]>(`${this.apiUrl}current-user-job-offers`);
  }
  
  getRecentJobOffers(): Observable<JobOfferModel[]> {
    return this.http.get<JobOfferModel[]>(`${this.apiUrl}recent-job-offers`);
  }

  getJobOfferById(id: number): Observable<JobOfferModel> {
    return this.http.get<JobOfferModel>(`${this.apiUrl}${id}`);
  }

  createJobOffer(jobOffer: FormData): Observable<JobOfferModel> {
    return this.http.post<JobOfferModel>(this.apiUrl + 'createJob', jobOffer, {
      headers: this.getAuthHeaders(),
    });
  }

  updateJobOffer(id: number, jobOffer: FormData): Observable<JobOfferModel> {
    return this.http.post<JobOfferModel>(
      `${this.apiUrl}update/${id}`,
      jobOffer,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  deleteJobOffer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}`);
  }

  getAuthHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    };
  }
}
