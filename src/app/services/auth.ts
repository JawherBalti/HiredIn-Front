// auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';

interface LoginResponse {
  user: any;
  token: string;
}

@Injectable({
  providedIn: 'root'
})

export class Auth {
  private apiUrl = 'http://localhost:8000/api'; // Your Laravel API URL
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkAuthStatus();
  }

  private checkAuthStatus() {
    const token = localStorage.getItem('auth_token');
    this.isAuthenticatedSubject.next(!!token);
  }

  register(userData: any) {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      tap((response: any) => {
        console.log(response)
      })
    );
  }

  login(credentials: any) {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        this.storeAuthData(response);
      })
    );
  }

  logout() {
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        this.clearAuthData();
        this.router.navigate(['/login']);
      })
    );
  }

  private storeAuthData(response: LoginResponse) {
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.isAuthenticatedSubject.next(true);
  }

  private clearAuthData() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.isAuthenticatedSubject.next(false);
  }

  // Add to your AuthService
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 'admin' : false;
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    };
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  redirectBasedOnAuth(redirectUrl: string, fallbackUrl: string = '/login') {
    if (this.isLoggedIn()) {
      this.router.navigate([redirectUrl]);
    } else {
      this.router.navigate([fallbackUrl], { 
        queryParams: { returnUrl: redirectUrl } 
      });
    }
  }
}