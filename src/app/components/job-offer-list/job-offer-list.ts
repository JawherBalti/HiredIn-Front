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
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOption, MatSelect, MatSelectModule } from '@angular/material/select';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-job-offer-list',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    DragDropModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    DateAgoPipe,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './job-offer-list.html',
  styleUrl: './job-offer-list.css',
})
export class JobOfferList implements OnInit {
  // Remove searchControl and use simple properties
  searchQuery: string = '';
  // Filter properties
  jobTypeFilter: string = '';
  industryFilter: string = '';
  dateFilter: string = '';
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Available options for filters
  jobTypes = ['', 'remote', 'onsite', 'hybrid'];
  industries: string[] = [];
  dateFilters = [
    { value: '', label: 'Any time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'custom', label: 'Custom range' },
  ];

  jobOffers: JobOfferModel[] = [];
  interviews: Interview[] = [];
  appliedJobs: any[] = [];
  filteredJobs: { [status: string]: JobOfferModel[] } = {};
  statuses = ['offer', 'applied', 'interview'];
  loading = true;
  errorMessage = '';
  activeStatus = 'offer';
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
    this.loadAppliedJobs();
    this.loadInterviews(this.currentUserId);
    this.loadIndustries();
  }

  loadIndustries(): void {
    // You might want to load this from an API or use a predefined list
    this.industries = [
      '',
      'Technology',
      'Healthcare',
      'Finance',
      'Education',
      'Manufacturing',
      'Retail',
      'Hospitality',
      'Marketing',
      'Other',
    ];
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
  }

  onSearch(): void {
    this.performSearch();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.jobTypeFilter = '';
    this.industryFilter = '';
    this.dateFilter = '';
    this.startDate = null;
    this.endDate = null;
    this.performSearch();
  }

  onFilterChange(): void {
    // Reset to first page when filters change
    this.currentPage = 1;
    this.appliedCurrentPage = 1;
    this.interviewsCurrentPage = 1;
    this.performSearch();
  }

  onDateRangeChange(): void {
    if (this.dateFilter === 'custom' && this.startDate && this.endDate) {
      this.onFilterChange();
    }
  }

  getFilters(): any {
    const filters: any = {
      search: this.searchQuery,
      job_type: this.jobTypeFilter,
      industry: this.industryFilter,
      date_filter: this.dateFilter,
    };

    if (this.dateFilter === 'custom' && this.startDate && this.endDate) {
      filters.start_date = this.startDate.toISOString().split('T')[0];
      filters.end_date = this.endDate.toISOString().split('T')[0];
    }

    return filters;
  }

  performSearch(): void {
    // Reset to first page when searching
    this.currentPage = 1;
    this.appliedCurrentPage = 1;
    this.interviewsCurrentPage = 1;

    switch (this.activeStatus) {
      case 'offer':
        this.loadJobOffers();
        break;
      case 'applied':
        this.loadAppliedJobs();
        break;
      case 'interview':
        this.loadInterviews(this.currentUserId);
        break;
    }
  }

  isJobCreator(jobOffer: any): boolean {
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
        this.filteredJobs['interview'] = this.mapInterviewsToJobOffers(
          this.interviews
        );
        break;
      default:
        this.jobCategory = 'Offers';
    }
  }

  loadInterviews(userId: number): void {
    const filters = this.getFilters();

    this.interviewService
      .getInterviewsByApplicant(
        userId,
        this.interviewsCurrentPage,
        this.interviewsItemsPerPage,
        filters
      )
      .subscribe({
        next: (response: any) => {
          let interviewsData: any[];
          let paginationInfo: any = null;

          if (Array.isArray(response)) {
            interviewsData = response;
            this.interviews = interviewsData;
            this.interviewsTotalItems = interviewsData.length;
            this.interviewsTotalPages = Math.ceil(
              interviewsData.length / this.interviewsItemsPerPage
            );
            this.interviewsPaginationInfo = `Showing all ${interviewsData.length} interviews`;
          } else if (response.data && response.pagination) {
            interviewsData = response.data;
            paginationInfo = response.pagination;
            this.interviews = interviewsData;
            this.interviewsTotalItems = paginationInfo.total;
            this.interviewsTotalPages = paginationInfo.last_page;
            this.updateInterviewsPaginationInfo(paginationInfo);
          } else {
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
    const filters = this.getFilters();

    this.resumeService
      .getUserApplications(
        this.appliedCurrentPage,
        this.appliedItemsPerPage,
        filters
      )
      .subscribe({
        next: (response: any) => {
          let applications: any[];
          let paginationInfo: any = null;

          if (Array.isArray(response)) {
            applications = response;
            this.appliedTotalItems = applications.length;
            this.appliedTotalPages = Math.ceil(
              applications.length / this.appliedItemsPerPage
            );
            this.appliedPaginationInfo = `Showing all ${applications.length} applications`;
          } else if (response.data && response.pagination) {
            applications = response.data;
            paginationInfo = response.pagination;
            this.appliedTotalItems = paginationInfo.total;
            this.appliedTotalPages = paginationInfo.last_page;
            this.updateAppliedPaginationInfo(paginationInfo);
          } else {
            applications = response;
            this.appliedTotalItems = applications.length;
            this.appliedTotalPages = 1;
            this.appliedPaginationInfo = `Showing ${applications.length} applications`;
          }

          this.appliedJobs = applications.map((app: any) => ({
            ...app.job_offer,
            application_status: app.status,
            applied_at: app.applied_at,
            resume_id: app.resume_id,
            cover_letter: app.cover_letter,
            interview: app.interview,
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
    const filters = this.getFilters();

    this.jobOfferService
      .getJobOffers(this.currentPage, this.itemsPerPage, filters)
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
