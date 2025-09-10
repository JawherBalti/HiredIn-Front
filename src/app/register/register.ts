import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../services/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Add this
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinner
  ],  templateUrl: './register.html',
  styleUrl: './register.css'
})

export class Register {
  registerForm: FormGroup;
  loading = false;
  error = '';
  returnUrl: string;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router,
    private route: ActivatedRoute
  ) {

    // In register.component.ts
    this.registerForm = this.fb.group({
      // ... other fields ...
      password_confirmation: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });

    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', Validators.required]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/login';
  }

  // Add this method
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('password_confirmation')?.value
      ? null : { mismatch: true };
  }

  // register.component.ts
  onSubmit() {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.error = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        if (err.error?.errors?.email) {
          this.error = err.error.errors.email[0];
        } else {
          this.error = err.error?.message || 'Registration failed. Please try again.';
        }
        this.loading = false;
      }
    });
  }
}
