import { Component, OnInit } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, // This provides *ngIf
    RouterModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})

export class Navbar implements OnInit {
  showMenu = false;
  showMobileMenu = false;
  unreadCount = 0;
  private countSubscription!: Subscription;

  constructor(private notifService: NotificationService, public authService: Auth, private router: Router) {}


  ngOnInit(): void {
    this.countSubscription = this.notifService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
  }

  ngOnDestroy(): void {
    if (this.countSubscription) {
      this.countSubscription.unsubscribe();
    }
  }
  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
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
      }
    });
  }

  fetchUnreadCount() {
    this.notifService.getUnreadNotifCount().subscribe({
      next: (response: any) => {
        this.unreadCount = response.count;
      },
      error: (err) => {
        console.error('Error fetching unread count:', err);
      }
    });
  }
}