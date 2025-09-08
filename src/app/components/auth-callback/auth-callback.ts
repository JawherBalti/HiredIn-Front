import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [
    MatProgressSpinnerModule, // Add this line
  ],
  template: `
    <div class="loading-container">
      <mat-spinner></mat-spinner>
      <p>Completing login...</p>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: Auth
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const user = params['user'];

      if (token && user) {
        // Store auth data
        this.authService.storeAuthData({
          token: token,
          user: JSON.parse(user)
        });
        
        // Redirect to home or intended page
        this.router.navigate(['/']);
      } else {
        // Handle error
        this.router.navigate(['/login'], { 
          queryParams: { error: 'auth_failed' } 
        });
      }
    });
  }
}