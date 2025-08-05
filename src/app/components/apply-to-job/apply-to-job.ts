import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ResumeService } from '../../services/resume';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-apply-to-job',
  standalone: true,
  imports: [    
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './apply-to-job.html',
  styleUrl: './apply-to-job.css'
})
export class ApplyToJob implements OnInit {
  jobOfferId: number = 0;
  isApplying = false;
  applicationSuccess = false;
  error: string = '';
  applyForm: FormGroup;
  resumeFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private resumeService: ResumeService,
    private fb: FormBuilder
  ) {
    this.applyForm = this.fb.group({
      resume: [null, Validators.required],
      coverLetter: ['']
    });
  }

  ngOnInit(): void {
    this.jobOfferId = +this.route.snapshot.paramMap.get('id')!;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.resumeFile = input.files[0];
      this.applyForm.patchValue({
        resume: this.resumeFile
      });
      this.applyForm.get('resume')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.applyForm.invalid || !this.resumeFile) {
      this.applyForm.markAllAsTouched();
      this.error = 'Please select a resume file';
      return;
    }

    this.isApplying = true;
    this.error = '';

    this.resumeService.applyToJob(
      this.jobOfferId, 
      this.resumeFile, 
      this.applyForm.value.coverLetter
    ).subscribe({
      next: () => {
        this.applicationSuccess = true;
        this.isApplying = false;
        this.applyForm.reset();
      },
      error: (error) => {
        this.error = error.error?.message || 'Application failed';
        this.isApplying = false;
      }
    });
  }

  get f() {
    return this.applyForm.controls;
  }
}