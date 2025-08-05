// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../services/auth'
import Pusher from 'pusher-js';

const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  pusher: {
    key: "af99ae9420a0d7abf644",
    cluster: 'eu'
  }
};

@Injectable({
  providedIn: 'root'
})



export class NotificationService {
  private pusher: any;
  private channel: any;

  constructor(private http: HttpClient, private authService: Auth) {
    this.initializePusher();
  }

  private initializePusher(): void {
    if (this.authService.isLoggedIn()) {
      const token = localStorage.getItem('auth_token');
      this.pusher = new Pusher(environment.pusher.key, {
        cluster: environment.pusher.cluster,
        authEndpoint: `${environment.apiUrl}/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      });

    this.channel = this.pusher.subscribe(`private-App.Models.User.${this.authService.getCurrentUser().id}`);
      
    this.channel.bind('Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', (data: any) => {
      const message = data.notification.data.message;
      console.log('New notification:', data);
      this.showToast(message);
    });
    }
  }

  getNotifications() {
    return this.http.get(`${environment.apiUrl}/api/notifications`);
  }

  markAsRead(notificationId: string) {
    return this.http.post(`${environment.apiUrl}/api/notifications/${notificationId}/read`, {});
  }

  // Add these methods to your existing service

// markAsRead() {
//     return this.http.post(`${environment.apiUrl}/api/notifications/mark-as-read`, {});
// }

  private showToast(message: string): void {
    // Implement your toast notification logic here
    // Example: using Angular Material Snackbar
    console.log('Show toast:', message);
  }

  subscribeToNotifications(callback: (notification: any) => void): void {
    if (this.channel) {
      this.channel.bind(
        'Illuminate\\Notifications\\Events\\BroadcastNotificationCreated',
        (data: any) => {
          const notification = data.notification;
          callback(notification.data); // send only the relevant data
          this.showToast(notification.data.message);
        }
      );
    }
  }

}