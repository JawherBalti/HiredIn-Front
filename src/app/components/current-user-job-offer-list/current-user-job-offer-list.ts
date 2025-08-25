import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
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
  loading = false
  errorMessage = ""

    constructor(
      private jobOfferService: JobOfferService,
    ) {}

  ngOnInit(): void {
    this.loadJobOffers();
  }

    loadJobOffers(): void {
      this.jobOfferService
        .getCurrentUserJobs()
        .subscribe(res => {
          this.jobOffers = res
        });
    }
}
