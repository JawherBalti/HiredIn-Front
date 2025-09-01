import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CompanyService } from '../../services/company';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyModel } from '../../models/company.model';
import { Observable } from 'rxjs';
import { CommonModule, Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-company-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './company-form.html',
  styleUrl: './company-form.css',
})
export class CompanyForm implements OnInit {
  companyForm: FormGroup;
  isEditMode = false;
  currentCompanyId: number | null = null;
  loading = false;
  countLoading = false;
  companyDataLoading = false;
  companiesCount = 0;
  errorMessage = '';
  imagePreview: string | null = null; // Add this for image preview

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      website: ['', [Validators.pattern('https?://.+')]],
      industry: [''],
      description: [''],
      image: [null],
    });
  }

  ngOnInit(): void {
    this.loadCompanies();

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.currentCompanyId = +params['id'];
        this.loadCompany(this.currentCompanyId);
      }
    });
  }

  loadCompany(id: number): void {
    this.companyDataLoading = true;
    this.companyService.getCompanyById(id).subscribe(
      (data) => {
        this.companyForm.patchValue({
          id: data.id,
          name: data.name,
          description: data.description,
          website: data.website,
          industry: data.industry,
          image: data.logo_url,
        });
        
        // Set image preview when loading existing company
        if (data.logo_url) {
          this.imagePreview = data.logo_url;
        }
        
        this.companyDataLoading = false;
      },
      (error) => {
        console.error('Error fetching company', error);
        this.companyDataLoading = false;
      }
    );
  }

  goBack(): void {
    this.location.back();
  }

  loadCompanies(): void {
    this.countLoading = true;
    this.companyService.getCurrentUserCompanies().subscribe({
      next: (data) => {
        this.companiesCount = data.length;
        this.countLoading = false;
      },
      error: (err) => {
        this.countLoading = false;
        console.error(err);
      },
    });
  }

  select(e: any) {
    const file = e.target.files[0];
    if (file) {
      this.companyForm.patchValue({
        image: file,
      });
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imagePreview = null;
    this.companyForm.patchValue({
      image: null,
    });
    
    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    if (this.companyForm.invalid) {
      this.markFormGroupTouched(this.companyForm);
      this.loading = false;
      return;
    }

    // Only check limit for new companies, not edits
    if (!this.isEditMode && this.companiesCount >= 3) {
      this.errorMessage = 'You have reached the maximum limit of 3 companies per user.';
      this.loading = false;
      return;
    }

    const file = this.companyForm.get('image')?.value;
    
    // If we're in edit mode and no new file was selected, use existing logo_url
    if (this.isEditMode && typeof file === 'string') {
      this.createOrUpdateCompany(file);
      return;
    }
    
    // If no file is selected but we're in edit mode, use existing image
    if (this.isEditMode && !file && this.imagePreview) {
      this.createOrUpdateCompany(this.imagePreview);
      return;
    }

    // If no file is selected and not in edit mode, show error
    if (!file && !this.isEditMode) {
      this.errorMessage = 'Please select a company logo';
      this.loading = false;
      return;
    }

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
          this.createOrUpdateCompany(data.secure_url);
        } else {
          throw new Error('Image upload failed');
        }
      })
      .catch((error) => {
        this.loading = false;
        this.errorMessage = 'Image upload failed. Please try again.';
        console.error('Upload error:', error);
      });
  }

  private createOrUpdateCompany(logoUrl: string): void {
    const companyData: CompanyModel = {
      name: this.companyForm.value.name,
      website: this.companyForm.value.website,
      industry: this.companyForm.value.industry,
      description: this.companyForm.value.description,
      logo_url: logoUrl,
    };

    const request: Observable<CompanyModel> =
      this.isEditMode && this.currentCompanyId
        ? this.companyService.updateCompany(this.currentCompanyId, companyData)
        : this.companyService.createCompany(companyData);

    request.subscribe({
      next: () => {
        this.loading = false;
        // this.router.navigate(['/companies'], {
        //   state: {
        //     success: true,
        //     message: this.isEditMode
        //       ? 'Company updated successfully!'
        //       : 'Company created successfully!',
        //   },
        // });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err.error?.message || 'An error occurred. Please try again.';
        console.error('Company operation failed:', err);
      },
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