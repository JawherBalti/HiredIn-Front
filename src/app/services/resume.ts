// src/app/services/resume.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResumeService {
  private apiUrl = 'http://localhost:8000/api/job-offers';

  constructor(private http: HttpClient) { }

  applyToJob(jobOfferId: number, resumeFile: File, coverLetter?: string): Observable<any> {
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

  getUserApplications(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/applications`, {
      headers: this.getAuthHeaders()
    });
  }

  downloadResume(resumeId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/resumes/${resumeId}/download`, { responseType: 'blob' });
  }

  updateApplicationStatus(resumeId: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/resumes/${resumeId}/status`, { status });
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    };
  }
}