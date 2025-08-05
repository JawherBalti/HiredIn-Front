import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompanyModel } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = 'http://localhost:8000/api/';

  constructor(private http: HttpClient) { }

  getCompanies(): Observable<CompanyModel[]> {
    return this.http.get<CompanyModel[]>(this.apiUrl + 'companies/');
  }

  getCurrentUserCompanies(): Observable<CompanyModel[]> {
    return this.http.get<CompanyModel[]>(this.apiUrl + 'companies/current-user-companies');
  }

  createCompany(company: CompanyModel): Observable<CompanyModel> {
    return this.http.post<CompanyModel>(this.apiUrl + 'companies/createCompany', company, {
      headers: this.getAuthHeaders()
    });
  }

  updateCompany(id: number, company: CompanyModel): Observable<CompanyModel> {
    return this.http.put<CompanyModel>(`${this.apiUrl}/${id}`, company);
  }

  deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    };
  }
}