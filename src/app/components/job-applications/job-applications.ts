import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ResumeService } from '../../services/resume';
import { InterviewService } from '../../services/interview';
import { CommonModule, Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ScheduleInterviewDialogComponent } from '../schedule-interview-dialog/schedule-interview-dialog';
import { DatePipe } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-job-applications',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    DatePipe,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption
  ], // Add DragDropModule here],
  templateUrl: './job-applications.html',
  styleUrl: './job-applications.css',
})
// src/app/components/job-applications/job-applications.component.ts
export class JobApplications implements OnInit {
  jobOfferId: number = 0;
  applications: any[] = [];
  isLoading = true;
  error: string = '';

  showInterviewForm: { [key: number]: boolean } = {};
  interviews: { [key: number]: any } = {};

  constructor(
    private route: ActivatedRoute,
    private resumeService: ResumeService,
    private interviewService: InterviewService,
    private location: Location,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.jobOfferId = +this.route.snapshot.paramMap.get('id')!;
    this.loadApplications();
  }

  goBack(): void {
    this.location.back();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.resumeService.getApplicationsForJob(this.jobOfferId).subscribe({
      next: (applications) => {
        this.applications = applications;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load applications';
        this.isLoading = false;
        console.error('Error loading applications:', error);
      },
    });
  }

  downloadResume(applicationId: number): void {
    this.resumeService.downloadResume(applicationId).subscribe(
      (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      },
      (error) => {
        this.error = 'Failed to download resume';
      }
    );
  }

  updateStatus(applicationId: number, status: string): void {
    this.resumeService.updateApplicationStatus(applicationId, status).subscribe(
      () => {
        this.loadApplications(); // Refresh the list
      },
      (error) => {
        this.error = 'Failed to update status';
      }
    );
  }

  toggleInterviewForm(applicationId: number): void {
    this.showInterviewForm[applicationId] =
      !this.showInterviewForm[applicationId];
    if (this.showInterviewForm[applicationId]) {
      this.loadInterview(applicationId);
    }
  }

  loadInterview(applicationId: number): void {
    this.interviewService.getInterviewForResume(applicationId).subscribe(
      (interview) => {
        this.interviews[applicationId] = interview;
      },
      (error) => {
        console.error('Error loading interview', error);
      }
    );
  }

  openScheduleDialog(application: any): void {
    const dialogRef = this.dialog.open(ScheduleInterviewDialogComponent, {
      width: '500px',
      data: {
        application,
        existingInterview: application.interview,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.isUpdate) {
          this.interviewService
            .updateInterview(result.interview.id, result.data)
            .subscribe(() => this.loadApplications());
        } else {
          this.interviewService
            .scheduleInterview(application.id, result.data)
            .subscribe(() => this.loadApplications());
        }
      }
    });
  }

  formatDateTime(dateTime: string): string {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleString();
  }
}
