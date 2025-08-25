import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PaginatedApplicationsResponse, ResumeService } from '../../services/resume';
import { InterviewService } from '../../services/interview';
import { CommonModule, Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ScheduleInterviewDialogComponent } from '../schedule-interview-dialog/schedule-interview-dialog';
import { DatePipe } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { JobOfferService } from '../../services/job-offer';
import { JobOfferModel } from '../../models/job-offer.model';

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
    MatOption,
  ], // Add DragDropModule here],
  templateUrl: './job-applications.html',
  styleUrl: './job-applications.css',
})
// src/app/components/job-applications/job-applications.component.ts
export class JobApplications implements OnInit {
  jobOfferId: number = 0;
  jobOffer: JobOfferModel | null = null;
  applications: any[] = [];
  isLoading = true;
  error: string = '';

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 9;
  totalItems = 0;
  totalPages = 1;
  paginationInfo: string = '';

  showInterviewForm: { [key: number]: boolean } = {};
  interviews: { [key: number]: any } = {};

  constructor(
    private jobOfferService: JobOfferService,
    private route: ActivatedRoute,
    private resumeService: ResumeService,
    private interviewService: InterviewService,
    private location: Location,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.jobOfferId = +this.route.snapshot.paramMap.get('id')!;
    this.loadApplications();
    this.loadJobOffer();
  }

  goBack(): void {
    this.location.back();
  }

  loadJobOffer(): void {
    if (!this.jobOfferId) {
      // this.errorMessage = 'No job offer ID provided';
      // this.loading = false;
      return;
    }

    this.jobOfferService.getJobOfferById(this.jobOfferId).subscribe({
      next: (data) => {
        this.jobOffer = data;
        // this.loading = false;
      },
      error: (error) => {
        // this.errorMessage = 'Failed to load job offer details';
        // this.loading = false;
        console.error('Error fetching job offer', error);
      },
    });
  }

  loadApplications(): void {
    this.isLoading = true;
    this.resumeService
      .getApplicationsForJob(
        this.jobOfferId,
        this.currentPage,
        this.itemsPerPage
      )
      .subscribe({
        next: (response: PaginatedApplicationsResponse) => {
          // Handle both old array format and new paginated format
          if (Array.isArray(response)) {
            // Old format - no pagination
            this.applications = response;
            this.totalItems = response.length;
            this.totalPages = Math.ceil(response.length / this.itemsPerPage);
            this.paginationInfo = `Showing all ${response.length} applications`;
          } else if (response.data && response.pagination) {
            // New paginated format
            this.applications = response.data;
            this.totalItems = response.pagination.total;
            this.totalPages = response.pagination.last_page;
            this.updatePaginationInfo(response.pagination);
          } else {
            // Fallback
            this.applications = [];
            this.totalItems = this.applications.length;
            this.totalPages = 1;
            this.paginationInfo = `Showing ${this.applications.length} applications`;
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Failed to load applications';
          this.isLoading = false;
          console.error('Error loading applications:', error);
        },
      });
  }

  updatePaginationInfo(pagination: any): void {
    this.paginationInfo = `Showing ${pagination.from} to ${pagination.to} of ${pagination.total} applications`;
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadApplications();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadApplications();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadApplications();
    }
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
