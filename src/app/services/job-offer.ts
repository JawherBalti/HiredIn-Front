import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobOfferModel } from '../models/job-offer.model';

@Injectable({
  providedIn: 'root'
})
export class JobOfferService {
  private apiUrl = 'http://localhost:8000/api/job-offers/';

  constructor(private http: HttpClient) { }

  getJobOffers(): Observable<JobOfferModel[]> {
    return this.http.get<JobOfferModel[]>(this.apiUrl);
  }

  getJobOfferById(id: number): Observable<JobOfferModel> {
    return this.http.get<JobOfferModel>(`${this.apiUrl}${id}`);
  }

  createJobOffer(jobOffer: FormData): Observable<JobOfferModel> {
    return this.http.post<JobOfferModel>(this.apiUrl + 'createJob', jobOffer, {
      headers: this.getAuthHeaders()
    });
  }

  updateJobOffer(id: number, jobOffer: FormData): Observable<JobOfferModel> {
    return this.http.post<JobOfferModel>(`${this.apiUrl}update/${id}`, jobOffer, {
      headers: this.getAuthHeaders()
    });
  }

  deleteJobOffer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}`);
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    };
  }
}