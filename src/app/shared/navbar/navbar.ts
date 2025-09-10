import { Component, HostListener, OnInit } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification';
import { Subscription } from 'rxjs';
import { EchoService } from '../../services/echo';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, // This provides *ngIf
    RouterModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  showMenu = false;
  showMobileMenu = false;
  unreadCount = 0;
  currentUserAvatar: any = null;
  private countSubscription!: Subscription;
  private loginSubscription!: Subscription;

  notification: any = null;

  constructor(
    private notifService: NotificationService,
    public authService: Auth,
    private router: Router,
    private echoService: EchoService
  ) {}

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    // Check if click was outside the menu elements
    const userMenu = document.querySelector('.user-menu');
    const mobileMenuButton = document.querySelector('.mobile-menu-button');

    if (this.showMenu && userMenu && !userMenu.contains(event.target as Node)) {
      this.showMenu = false;
    }

    if (
      this.showMobileMenu &&
      mobileMenuButton &&
      !mobileMenuButton.contains(event.target as Node)
    ) {
      // Also check if click wasn't inside the mobile menu itself
      const mobileMenu = document.querySelector('.mobile-menu');
      if (mobileMenu && !mobileMenu.contains(event.target as Node)) {
        this.showMobileMenu = false;
      }
    }
  }

  listenForNotifications() {
    const echo = this.echoService.getEcho();

    echo
      .channel('notifications')
      .listen('.notification.received', (data: any) => {
        // this.showNotification({
        //   title: 'New Notification',
        //   message: data.message,
        //   time: data.time,
        //   type: data.type
        // });
      });

    const user = this.authService.getCurrentUser();
    if (user) {
      echo
        .private(`notification.${user.id}`)
        .listen('Notificationsent', (data: any) => {
          this.showSimpleToast(
            data.message,
            'New Notification',
            'info' // or use data.type if available
          );

          // Also update notification count
          this.fetchUnreadCount();
          console.log(data);
        });
    }
  }

  showSimpleToast(
    message: string,
    title: string = 'Notification',
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'simple-toast';
    toast.setAttribute('data-type', type);

    toast.innerHTML = `
      <strong>${title}</strong>
      <p>${message}</p>
      <button onclick="this.parentElement.remove()">×</button>
    `;

    // Add to body
    document.body.appendChild(toast);

    // Handle click on close button
    const closeButton = toast.querySelector('button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.removeToast(toast);
      });
    }

    // Auto remove after 5 seconds
    // setTimeout(() => {
    //   this.removeToast(toast);
    // }, 5000);
  }

  // Helper method to remove toast with animation
  private removeToast(toast: HTMLElement) {
    toast.classList.add('toast-exit');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 300); // Match animation duration
  }

  dismiss() {
    this.notification = null;
  }

  ngOnInit(): void {
    this.listenForNotifications();

    this.currentUserAvatar = this.authService.getCurrentUser().avatar;
    console.log(this.currentUserAvatar);
    this.countSubscription = this.notifService.unreadCount$.subscribe(
      (count) => {
        this.unreadCount = count;
      }
    );

    // Listen for login events
    this.loginSubscription = this.authService.loginStatus$.subscribe(
      (isLoggedIn) => {
        if (isLoggedIn) {
          // Fetch notifications when user logs in
          this.fetchUnreadCount();
        } else {
          // Reset count when user logs out
          this.unreadCount = 0;
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.countSubscription) {
      this.countSubscription.unsubscribe();
    }
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMenu(): void {
    this.showMenu = false;
    this.showMobileMenu = false;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
        this.showMenu = false;
        this.showMobileMenu = false;
      },
      error: (err) => {
        console.error('Logout failed:', err);
      },
    });
  }

  fetchUnreadCount() {
    this.notifService.getUnreadNotifCount().subscribe({
      next: (response: any) => {
        this.unreadCount = response.count;
      },
      error: (err) => {
        console.error('Error fetching unread count:', err);
      },
    });
  }
}
