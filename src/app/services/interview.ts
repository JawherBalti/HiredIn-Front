// src/app/services/interview.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaginatedInterviewsResponse {
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
  providedIn: 'root'
})
export class InterviewService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  scheduleInterview(resumeId: number, data: any): Observable<any> {
      // Convert to MySQL compatible format
      const formattedData = {
          ...data,
          scheduled_time: new Date(data.scheduled_time).toISOString().slice(0, 19).replace('T', ' ')
      };
      return this.http.post(`${this.apiUrl}/interviews/resumes/${resumeId}/schedule`, formattedData);
  }

  getInterviewForResume(resumeId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/interviews/resumes/${resumeId}`);
  }

  updateInterview(interviewId: number, data: any): Observable<any> {
    const formattedData = {
      ...data,
      scheduled_time: new Date(data.scheduled_time).toISOString().slice(0, 19).replace('T', ' ')
    };
    return this.http.put(`${this.apiUrl}/interviews/${interviewId}`, formattedData);
  }

  // src/app/services/interview.service.ts
  getInterviewsByApplicant(userId: number, page: number = 1, perPage: number = 5): Observable<PaginatedInterviewsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<PaginatedInterviewsResponse>(`${this.apiUrl}/users/${userId}/interviews`, { params });
  }
}