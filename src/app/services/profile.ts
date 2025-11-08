import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    jobAlerts: boolean;
    applicationUpdates: boolean;
    interviewReminders: boolean;
    newsletter: boolean;
  };
  privacy: {
    profileVisibility: string;
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: boolean;
    dataSharing: boolean;
  };
  preferences: {
    jobType: string[];
    industries: string[];
    salaryRange: { min: number; max: number };
    language: string;
    location: string;
    timezone: string;
    currency: string;
  };
}

export interface ProfileResponse {
  user: UserProfile;
  settings: UserSettings;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/profile`);
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, profileData);
  }

  changePassword(passwordData: { current_password: string; new_password: string; new_password_confirmation: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile/password`, passwordData);
  }

  updateSettings(settings: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile/settings`, { settings });
  }

  uploadAvatar(avatarFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    return this.http.post(`${this.apiUrl}/profile/avatar`, formData);
  }

  removeAvatar(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/profile/avatar`);
  }

  exportData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/export`);
  }

  deleteAccount(password: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/profile`, {
      body: { password }
    });
  }
}