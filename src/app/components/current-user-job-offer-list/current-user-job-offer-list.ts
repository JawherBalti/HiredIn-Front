import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { DateAgoPipe } from '../../date-ago-pipe';
import { JobOfferModel } from '../../models/job-offer.model';
import { JobOfferService, PaginatedResponse } from '../../services/job-offer';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-current-user-job-offer-list',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    DragDropModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    DateAgoPipe,
    MatFormFieldModule,
    MatInputModule, // Must be imported
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule, // Add this line
  ],
  templateUrl: './current-user-job-offer-list.html',
  styleUrl: './current-user-job-offer-list.css',
})
export class CurrentUserJobOfferList implements OnInit {
  jobOffers: JobOfferModel[] = [];
  loading = false;
  searchLoading = false;
  errorMessage = '';

  // Filter properties
  searchQuery: string = '';
  jobTypeFilter: string = '';
  industryFilter: string = '';
  statusFilter: string = '';
  dateFilter: string = '';
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Available options for filters
  jobTypes = ['', 'remote', 'onsite', 'hybrid'];
  industries: string[] = [];
  statuses = ['', 'offer', 'applied', 'interview', 'rejected', 'accepted'];
  dateFilters = [
    { value: '', label: 'Any time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'custom', label: 'Custom range' },
  ];

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 9;
  totalItems = 0;
  totalPages = 1;
  paginationInfo: string = '';

  constructor(
    private jobOfferService: JobOfferService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.loadJobOffers();
    this.loadIndustries();
  }

  loadIndustries(): void {
    // You might want to load this from an API endpoint
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
    this.currentPage = 1;
    this.loadJobOffers();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadJobOffers();
  }

  onDateRangeChange(): void {
    if (this.dateFilter === 'custom' && this.startDate && this.endDate) {
      this.onFilterChange();
    }
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.jobTypeFilter = '';
    this.industryFilter = '';
    this.statusFilter = '';
    this.dateFilter = '';
    this.startDate = null;
    this.endDate = null;
    this.currentPage = 1;
    this.loadJobOffers();
  }

  getFilters(): any {
    const filters: any = {
      search: this.searchQuery,
      job_type: this.jobTypeFilter,
      industry: this.industryFilter,
      status: this.statusFilter,
      date_filter: this.dateFilter,
    };

    if (this.dateFilter === 'custom' && this.startDate && this.endDate) {
      filters.start_date = this.startDate.toISOString().split('T')[0];
      filters.end_date = this.endDate.toISOString().split('T')[0];
    }

    return filters;
  }

  loadJobOffers(): void {
    this.loading = true;
    const filters = this.getFilters();

    this.jobOfferService
      .getCurrentUserJobs(this.currentPage, this.itemsPerPage, filters)
      .subscribe({
        next: (response: any) => {
          if (Array.isArray(response)) {
            this.jobOffers = response;
            this.totalItems = response.length;
            this.totalPages = Math.ceil(response.length / this.itemsPerPage);
            this.paginationInfo = `Showing all ${response.length} job offers`;
          } else if (response.data && response.pagination) {
            this.jobOffers = response.data;
            this.totalItems = response.pagination.total;
            this.totalPages = response.pagination.last_page;
            this.updatePaginationInfo(response.pagination);
          } else {
            this.jobOffers = [];
            this.totalItems = 0;
            this.totalPages = 1;
            this.paginationInfo = 'No job offers found';
          }
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load job offers';
          this.loading = false;
          console.error(err);
        },
      });
  }

  updatePaginationInfo(pagination: any): void {
    this.paginationInfo = `Showing ${pagination.from} to ${pagination.to} of ${pagination.total} job offers`;
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

  goBack(): void {
    this.location.back();
  }
}
