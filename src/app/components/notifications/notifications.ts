import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css']
})
export class Notifications implements OnInit {
  notifications: any[] = [];
  unreadCount = 0;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadNotifications();

    // Subscribe to real-time events from Pusher
    this.notificationService.subscribeToNotifications((notification: any) => {
      // Add to top of list
      this.notifications.unshift(notification);

      // Update unread count
      this.unreadCount++;

      // Optionally show toast (handled inside service)
    });
  }

  loadNotifications() {
    this.notificationService.getNotifications().subscribe((response: any) => {
      this.notifications = response.all;
      this.unreadCount = response.unread.length;
    });
  }

  markAsRead(notificationId: string) {
    this.notificationService.markAsRead(notificationId).subscribe(() => {
      this.loadNotifications();
    });
  }

  // markAllAsRead() {
  //   this.notificationService.markAllAsRead().subscribe(() => {
  //     this.loadNotifications();
  //   });
  // }
}
