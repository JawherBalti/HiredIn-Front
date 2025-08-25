import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ResumeService } from '../../services/resume';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-apply-to-job-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogContent,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatDialogActions,
    MatInputModule, // Add MatInputModule here
  ],
  templateUrl: './apply-job-dialog.html',
  styleUrls: ['./apply-job-dialog.css'],
})
export class ApplyJobDialogComponent {
  applyForm: FormGroup;
  isApplying = false;
  error: string = '';
  successMessage: string = ''; // New success message variable

  resumeFile: File | null = null;

  constructor(
    public dialogRef: MatDialogRef<ApplyJobDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private resumeService: ResumeService
  ) {
    this.applyForm = this.fb.group({
      resume: [null, Validators.required],
      coverLetter: [''],
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.resumeFile = input.files[0];
      this.applyForm.patchValue({
        resume: this.resumeFile,
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

    this.resumeService
      .applyToJob(
        this.data.jobOfferId,
        this.resumeFile,
        this.applyForm.value.coverLetter
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Application submitted successfully!'; // Display success message
          this.isApplying = false;

          // Close the modal after 3 seconds
          setTimeout(() => {
            this.dialogRef.close({ success: true });
          }, 3000); // Adjust the time to your liking (3000ms = 3 seconds)
        },
        error: (error) => {
          this.error = error.error?.message || 'Application failed';
          this.isApplying = false;
        },
      });
  }

  get f() {
    return this.applyForm.controls;
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }
}
