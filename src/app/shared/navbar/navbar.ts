import { Component } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

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

export class Navbar {
  showMenu = false;
  showMobileMenu = false;

  constructor(public authService: Auth, private router: Router) {}

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
}
