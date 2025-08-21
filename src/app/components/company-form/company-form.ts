import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CompanyService } from '../../services/company';
import { Router } from '@angular/router';
import { CompanyModel } from '../../models/company.model';
import { Observable } from 'rxjs';
import { CommonModule, Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-company-form',
  imports: [
    CommonModule,
    ReactiveFormsModule, // Add this
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule, // Add this to imports
  ],
  templateUrl: './company-form.html',
  styleUrl: './company-form.css',
})
export class CompanyForm implements OnInit {
  companyForm: FormGroup;
  isEditMode = false;
  currentCompanyId: number | null = null;
  loading = false
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private router: Router,
    private location: Location
  ) {
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      website: ['', [Validators.pattern('https?://.+')]],
      industry: [''],
      description: [''],
      image: [null, Validators.required],
    });
  }

  ngOnInit(): void {}

  goBack(): void {
    this.location.back();
  }

  select(e: any) {
    const file = e.target.files[0];
    if (file) {
      this.companyForm.patchValue({
        image: file,
      });
    }
  }

  onSubmit(): void {
    if (this.companyForm.invalid) {
      this.markFormGroupTouched(this.companyForm);
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const file = this.companyForm.get('image')?.value;
    const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dv1lhvgjr/upload';

    const formData = new FormData();

    // Add Cloudinary-specific parameters
    formData.append('file', file);
    formData.append('upload_preset', 'eiqxfhzq');

    fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.secure_url) {
          const companyData: CompanyModel = {
            name: this.companyForm.value.name,
            website: this.companyForm.value.website,
            industry: this.companyForm.value.industry,
            description: this.companyForm.value.description,
            logo_url: data.secure_url,
          };

          const request: Observable<CompanyModel> =
            this.isEditMode && this.currentCompanyId
              ? this.companyService.updateCompany(
                  this.currentCompanyId,
                  companyData
                )
              : this.companyService.createCompany(companyData);

          request.subscribe({
            next: () => {
              this.loading = false;
              this.router.navigate(['/'], {
                state: {
                  success: true,
                  message: this.isEditMode
                    ? 'Company updated successfully!'
                    : 'Company created successfully!',
                },
              });
            },
            error: (err) => {
              this.loading = false;
              this.errorMessage =
                err.error?.message || 'An error occurred. Please try again.';
              console.error('Company operation failed:', err);
            },
          });
        }
      });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }
}
