import { Component, OnInit } from '@angular/core';
import { JobOfferService, PaginatedResponse } from '../../services/job-offer';
import { JobOfferModel } from '../../models/job-offer.model';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DateAgoPipe } from '../../date-ago-pipe';
import { Auth } from '../../services/auth';
import { ResumeService } from '../../services/resume';
import { Interview } from '../../models/interview.model';
import { InterviewService } from '../../services/interview';

@Component({
  selector: 'app-job-offer-list',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    DateAgoPipe, // Add this line
  ], // Add DragDropModule here],
  templateUrl: './job-offer-list.html',
  styleUrl: './job-offer-list.css',
})
export class JobOfferList implements OnInit {
  jobOffers: JobOfferModel[] = [];
  interviews: Interview[] = []; // Update the type
  appliedJobs: any[] = []; // Add this line for storing applied jobs
  filteredJobs: { [status: string]: JobOfferModel[] } = {};
  statuses = ['offer', 'applied', 'interview'];
  loading = true;
  errorMessage = '';
  activeStatus = 'offer'; // Default active tab
  jobCategory: string = 'Offers';
  currentUser: any = null;
  currentUserId: any = null;

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 9;
  totalItems = 0;
  totalPages = 1;
  paginationInfo: string = '';

  // Applied jobs pagination properties
  appliedCurrentPage = 1;
  appliedItemsPerPage = 9;
  appliedTotalItems = 0;
  appliedTotalPages = 1;
  appliedPaginationInfo: string = '';

  // Interviews pagination properties
  interviewsCurrentPage = 1;
  interviewsItemsPerPage = 9;
  interviewsTotalItems = 0;
  interviewsTotalPages = 1;
  interviewsPaginationInfo: string = '';

  constructor(
    private resumeService: ResumeService,
    private jobOfferService: JobOfferService,
    private interviewService: InterviewService,
    private authService: Auth
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.currentUserId = this.authService.getCurrentUser().id;
    this.loadJobOffers();
    this.loadAppliedJobs(); // Load applied jobs on init
    this.loadInterviews(this.currentUserId);
  }

  isJobCreator(jobOffer: any): boolean {
    // Check if current user exists and matches the job offer's user_id
    return this.currentUser && this.currentUser.id === jobOffer.user_id;
  }

  setActiveStatus(status: string): void {
    this.activeStatus = status;

    switch (status) {
      case 'offer':
        this.jobCategory = 'Offers';
        break;
      case 'applied':
        this.jobCategory = 'Applications';
        break;
      case 'interview':
        this.jobCategory = 'Interviews';
        // Map interviews to job offers format when switching to interview tab
        this.filteredJobs['interview'] = this.mapInterviewsToJobOffers(
          this.interviews
        );
        break;
      default:
        this.jobCategory = 'Offers';
    }
  }

  loadInterviews(userId: number): void {
    this.interviewService
      .getInterviewsByApplicant(
        userId,
        this.interviewsCurrentPage,
        this.interviewsItemsPerPage
      )
      .subscribe({
        next: (response: any) => {
          // Handle both old array format and new paginated format
          let interviewsData: any[];
          let paginationInfo: any = null;

          if (Array.isArray(response)) {
            // Old format - no pagination
            interviewsData = response;
            this.interviews = interviewsData;
            this.interviewsTotalItems = interviewsData.length;
            this.interviewsTotalPages = Math.ceil(
              interviewsData.length / this.interviewsItemsPerPage
            );
            this.interviewsPaginationInfo = `Showing all ${interviewsData.length} interviews`;
          } else if (response.data && response.pagination) {
            // New paginated format
            interviewsData = response.data;
            paginationInfo = response.pagination;
            this.interviews = interviewsData;
            this.interviewsTotalItems = paginationInfo.total;
            this.interviewsTotalPages = paginationInfo.last_page;
            this.updateInterviewsPaginationInfo(paginationInfo);
          } else {
            // Fallback
            interviewsData = response;
            this.interviews = interviewsData;
            this.interviewsTotalItems = interviewsData.length;
            this.interviewsTotalPages = 1;
            this.interviewsPaginationInfo = `Showing ${interviewsData.length} interviews`;
          }

          if (this.activeStatus === 'interview') {
            this.filteredJobs['interview'] = this.mapInterviewsToJobOffers(
              this.interviews
            );
          }
        },
        error: (error) => {
          this.errorMessage = 'Failed to load interviews';
          console.error('Error loading interviews:', error);
        },
      });
  }

  updateInterviewsPaginationInfo(pagination: any): void {
    this.interviewsPaginationInfo = `Showing ${pagination.from} to ${pagination.to} of ${pagination.total} interviews`;
  }

  // Interviews pagination methods
  goToInterviewsPage(page: number): void {
    if (
      page >= 1 &&
      page <= this.interviewsTotalPages &&
      page !== this.interviewsCurrentPage
    ) {
      this.interviewsCurrentPage = page;
      this.loadInterviews(this.currentUserId);
    }
  }

  nextInterviewsPage(): void {
    if (this.interviewsCurrentPage < this.interviewsTotalPages) {
      this.interviewsCurrentPage++;
      this.loadInterviews(this.currentUserId);
    }
  }

  previousInterviewsPage(): void {
    if (this.interviewsCurrentPage > 1) {
      this.interviewsCurrentPage--;
      this.loadInterviews(this.currentUserId);
    }
  }

  private mapInterviewsToJobOffers(interviews: Interview[]): any[] {
    return interviews.map((interview) => ({
      ...interview.job_offer,
      interview_details: {
        id: interview.id,
        scheduled_time: interview.scheduled_time,
        location: interview.location,
        status: interview.status,
      },
    }));
  }

  loadAppliedJobs(): void {
    this.resumeService
      .getUserApplications(this.appliedCurrentPage, this.appliedItemsPerPage)
      .subscribe({
        next: (response: any) => {
          // Handle both old array format and new paginated format
          let applications: any[];
          let paginationInfo: any = null;

          if (Array.isArray(response)) {
            // Old format - no pagination
            applications = response;
            this.appliedTotalItems = applications.length;
            this.appliedTotalPages = Math.ceil(
              applications.length / this.appliedItemsPerPage
            );
            this.appliedPaginationInfo = `Showing all ${applications.length} applications`;
          } else if (response.data && response.pagination) {
            // New paginated format
            applications = response.data;
            paginationInfo = response.pagination;
            this.appliedTotalItems = paginationInfo.total;
            this.appliedTotalPages = paginationInfo.last_page;
            this.updateAppliedPaginationInfo(paginationInfo);
          } else {
            // Fallback
            applications = response;
            this.appliedTotalItems = applications.length;
            this.appliedTotalPages = 1;
            this.appliedPaginationInfo = `Showing ${applications.length} applications`;
          }

          this.appliedJobs = applications.map((app: any) => ({
            ...app.job_offer, // This should now work with the correct structure
            application_status: app.status,
            applied_at: app.applied_at,
            resume_id: app.resume_id,
            cover_letter: app.cover_letter,
            interview: app.interview, // Include interview data if needed
          }));

          if (this.activeStatus === 'applied') {
            this.filteredJobs['applied'] = this.appliedJobs;
          }
        },
        error: (error) => {
          console.error('Error fetching applied jobs', error);
        },
      });
  }

  updateAppliedPaginationInfo(pagination: any): void {
    this.appliedPaginationInfo = `Showing ${pagination.from} to ${pagination.to} of ${pagination.total} applications`;
  }

  // Applied jobs pagination methods
  goToAppliedPage(page: number): void {
    if (
      page >= 1 &&
      page <= this.appliedTotalPages &&
      page !== this.appliedCurrentPage
    ) {
      this.appliedCurrentPage = page;
      this.loadAppliedJobs();
    }
  }

  nextAppliedPage(): void {
    if (this.appliedCurrentPage < this.appliedTotalPages) {
      this.appliedCurrentPage++;
      this.loadAppliedJobs();
    }
  }

  previousAppliedPage(): void {
    if (this.appliedCurrentPage > 1) {
      this.appliedCurrentPage--;
      this.loadAppliedJobs();
    }
  }

  loadJobOffers(): void {
    this.loading = true;
    this.jobOfferService
      .getJobOffers(this.currentPage, this.itemsPerPage)
      .subscribe({
        next: (response: PaginatedResponse<JobOfferModel>) => {
          this.jobOffers = response.data;
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.last_page;
          this.updatePaginationInfo(response.pagination);
          this.filterJobsByStatus();
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage =
            'Failed to load job offers. Please try again later.';
          this.loading = false;
          console.error('Error fetching job offers', error);
        },
      });
  }

  updatePaginationInfo(pagination: any): void {
    this.paginationInfo = `Showing ${pagination.from} to ${pagination.to} of ${pagination.total} entries`;
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadJobOffers();
    }
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadJobOffers();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadJobOffers();
    }
  }

  filterJobsByStatus(): void {
    this.statuses.forEach((status) => {
      this.filteredJobs[status] = this.jobOffers.filter(
        (jo) => jo.status === status
      );
    });
  }

  onDrop(event: CdkDragDrop<JobOfferModel[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const jobOffer = event.previousContainer.data[event.previousIndex];
      jobOffer.status = event.container.id as 'applied' | 'interview' | 'offer';
      this.updateJobOfferStatus(jobOffer);
    }
  }

  updateJobOfferStatus(jobOffer: JobOfferModel): void {
    this.jobOfferService
      .updateJobOffer(jobOffer.id!, this.prepareFormData(jobOffer))
      .subscribe({
        next: (updated) => {
          const index = this.jobOffers.findIndex((jo) => jo.id === updated.id);
          if (index !== -1) {
            this.jobOffers[index] = updated;
            this.filterJobsByStatus();
          }
        },
        error: (error) => console.error('Error updating job offer', error),
      });
  }

  prepareFormData(jobOffer: JobOfferModel): FormData {
    const formData = new FormData();
    Object.keys(jobOffer).forEach((key) => {
      if (jobOffer[key as keyof JobOfferModel] !== null && key !== 'company') {
        formData.append(
          key,
          jobOffer[key as keyof JobOfferModel]?.toString() ?? ''
        );
      }
    });
    return formData;
  }
}
