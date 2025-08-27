import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { DateAgoPipe } from '../../date-ago-pipe';
import { JobOfferModel } from '../../models/job-offer.model';
import { JobOfferService, PaginatedResponse } from '../../services/job-offer';

@Component({
  selector: 'app-current-user-job-offer-list',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    DateAgoPipe, // Add this line
  ],
  templateUrl: './current-user-job-offer-list.html',
  styleUrl: './current-user-job-offer-list.css',
})
export class CurrentUserJobOfferList implements OnInit {
  jobOffers: JobOfferModel[] = [];
  loading = false;
  errorMessage = '';

  
  // Pagination properties
  currentPage = 1;
  itemsPerPage = 9;
  totalItems = 0;
  totalPages = 1;
  paginationInfo: string = '';

  constructor(
    private jobOfferService: JobOfferService,
    private location: Location,

  ) {}

  ngOnInit(): void {
    this.loadJobOffers();
  }

  loadJobOffers(): void {
    this.loading = true;
    this.jobOfferService.getCurrentUserJobs(this.currentPage, this.itemsPerPage).subscribe({
      next: (response: any) => {
        // Handle both old array format and new paginated format
        if (Array.isArray(response)) {
          // Old format - no pagination
          this.jobOffers = response;
          this.totalItems = response.length;
          this.totalPages = Math.ceil(response.length / this.itemsPerPage);
          this.paginationInfo = `Showing all ${response.length} job offers`;
        } else if (response.data && response.pagination) {
          // New paginated format
          this.jobOffers = response.data;
          this.totalItems = response.pagination.total;
          this.totalPages = response.pagination.last_page;
          this.updatePaginationInfo(response.pagination);
        } else {
          // Fallback
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
      }
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
