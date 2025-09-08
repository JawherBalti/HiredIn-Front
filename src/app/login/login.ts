import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinner,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  loginForm: FormGroup;
  loading = false;
  error = '';
  returnUrl: string;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  ngOnInit(): void {
    // Check for auth errors
    this.route.queryParams.subscribe((params) => {
      if (params['error']) {
        this.error = 'Google authentication failed. Please try again.';
      }
    });
  }

  loginWithGoogle() {
    this.loading = true;
    this.authService.googleLogin();
  }

  // login.component.ts
  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.error = err.error?.message || 'Login failed. Please try again.';
        this.loading = false;
      },
    });
  }
}
