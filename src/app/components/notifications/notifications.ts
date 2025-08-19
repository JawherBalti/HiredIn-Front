import { Component, OnInit, OnDestroy } from '@angular/core';
import { Auth } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge'; // Add this import
import { DateAgoPipe } from '../../date-ago-pipe';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../services/notification';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule, // Add this
    DateAgoPipe,
    MatProgressSpinnerModule,
  ],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css'],
})
export class Notifications implements OnInit, OnDestroy {
  unreadCount: number = 0;
  notifications: any = {
    unread: [],
    read: [],
  };

  loadingStates: { [key: string]: boolean } = {}; // Track loading state per notification
  markAllLoading = false;
  isLoading = false; // Add loading state

  constructor(
    private notificationService: NotificationService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.fetchNotifications();
    this.fetchUnreadCount();
  }

  ngOnDestroy() {
    // Clean up listeners if needed
  }

  fetchNotifications() {
    this.isLoading = true; // Set loading state
    
    this.notificationService.getNotifications().subscribe({
      next: (response: any) => {
        this.notifications = {
          unread: response.unread || [],
          read: response.read || []
        };
        this.isLoading = false; // Clear loading state
      },
      error: (err) => {
        console.error('Error fetching notifications:', err);
        this.isLoading = false; // Clear loading state on error
      }
    });
  }

  fetchUnreadCount() {
    this.notificationService.getUnreadNotifCount().subscribe({
      next: (response: any) => {
        this.unreadCount = response.count;
      },
      error: (err) => {
        console.error('Error fetching unread count:', err);
      },
    });
  }

  markAsRead(notificationId: string) {
    this.loadingStates[notificationId] = true; // Set loading state

    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        this.fetchNotifications();
        this.loadingStates[notificationId] = false; // Clear loading state
      },
      error: (err) => {
        console.error('Error marking as read:', err);
        this.loadingStates[notificationId] = false; // Clear loading state on error
      },
    });
  }

  markAllAsRead() {
    this.markAllLoading = true;

    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.fetchNotifications();
        this.markAllLoading = false;
      },
      error: (err) => {
        console.error('Error marking all as read:', err);
        this.markAllLoading = false;
      },
    });
  }
}
