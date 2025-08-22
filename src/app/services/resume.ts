// src/app/services/resume.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaginatedApplicationsResponse {
  data: any[];
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
export class ResumeService {
  private apiUrl = 'http://localhost:8000/api/job-offers';

  constructor(private http: HttpClient) {}

  applyToJob(
    jobOfferId: number,
    resumeFile: File,
    coverLetter?: string
  ): Observable<any> {
    const formData = new FormData();
    formData.append('resume', resumeFile);
    if (coverLetter) {
      formData.append('cover_letter', coverLetter);
    }

    return this.http.post(`${this.apiUrl}/${jobOfferId}/apply`, formData);
  }

  getApplicationsForJob(jobOfferId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${jobOfferId}/applications`);
  }

  getUserApplications(
    page: number = 1,
    perPage: number = 9
  ): Observable<PaginatedApplicationsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<PaginatedApplicationsResponse>(
      `${this.apiUrl}/user/applications`,
      {
        headers: this.getAuthHeaders(),
        params: params,
      }
    );
  }

  downloadResume(resumeId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/resumes/${resumeId}/download`, {
      responseType: 'blob',
    });
  }

  updateApplicationStatus(resumeId: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/resumes/${resumeId}/status`, {
      status,
    });
  }

  getAuthHeaders() {
    return {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    };
  }
}
