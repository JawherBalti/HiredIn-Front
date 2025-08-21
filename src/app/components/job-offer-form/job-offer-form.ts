import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { JobOfferService } from '../../services/job-offer';
import { CompanyService } from '../../services/company';
import { CompanyModel } from '../../models/company.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Add this import

@Component({
  selector: 'app-job-offer-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './job-offer-form.html',
  styleUrl: './job-offer-form.css',
})
export class JobOfferForm implements OnInit {
  jobOfferForm: FormGroup;
  companies: CompanyModel[] = [];
  isEditMode = false;
  currentId: number | null = null;
  resumeFile: File | null = null;
  loading = true;

  constructor(
    private fb: FormBuilder,
    private jobOfferService: JobOfferService,
    private companyService: CompanyService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    this.jobOfferForm = this.fb.group({
      company_id: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      status: ['offer', Validators.required],
      type: ['hybrid', Validators.required],
      location: [''],
      deadline: [''],
      salary: [''],
    });
  }

  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    this.loadCompanies();

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.currentId = +params['id'];
        this.loadJobOffer(this.currentId);
      }
    });
  }

  loadCompanies(): void {
    this.companyService.getCurrentUserCompanies().subscribe(
      (data) => (this.companies = data),
      (error) => console.error('Error fetching companies', error)
    );
  }

  loadJobOffer(id: number): void {
    this.jobOfferService.getJobOfferById(id).subscribe(
      (data) => {
        this.jobOfferForm.patchValue({
          company_id: data.company_id,
          title: data.title,
          description: data.description,
          status: data.status,
          deadline: data.deadline
            ? new Date(data.deadline).toISOString().substring(0, 10)
            : '',
          salary: data.salary,
          location: data.location,
          notes: data.notes,
        });
      },
      (error) => console.error('Error fetching job offer', error)
    );
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.resumeFile = event.target.files[0];
    }
  }

  onSubmit(): void {
    if (this.jobOfferForm.valid) {
      this.loading = true;

      const formData = new FormData();
      Object.keys(this.jobOfferForm.value).forEach((key) => {
        if (this.jobOfferForm.value[key] !== null && key !== 'resume') {
          formData.append(key, this.jobOfferForm.value[key]);
        }
      });

      if (this.resumeFile) {
        formData.append('resume', this.resumeFile);
      }

      const request =
        this.isEditMode && this.currentId
          ? this.jobOfferService.updateJobOffer(this.currentId, formData)
          : this.jobOfferService.createJobOffer(formData);

      request.subscribe({
        next: () => {
          this.loading = false; // Reset loading state on success
          this.router.navigate(['/job-offers']);
        },
        error: (error) => {
          this.loading = false; // Reset loading state on error
          console.error('Error with job offer', error);
        },
      });
    }
  }
}
