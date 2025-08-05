import { Component, OnInit } from '@angular/core';
import { JobOfferService } from '../../services/job-offer';
import { JobOfferModel } from '../../models/job-offer.model';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DateAgoPipe } from '../../date-ago-pipe';
import { Auth } from '../../services/auth';
import { ResumeService } from '../../services/resume';

@Component({
  selector: 'app-job-offer-list',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,    
    DateAgoPipe // Add this line
], // Add DragDropModule here],
  templateUrl: './job-offer-list.html',
  styleUrl: './job-offer-list.css'
})

export class JobOfferList implements OnInit {
  jobOffers: JobOfferModel[] = [];
  appliedJobs: any[] = []; // Add this line for storing applied jobs
  filteredJobs: { [status: string]: JobOfferModel[] } = {};
  statuses = ['offer', 'applied', 'interview'];
  loading = true;
  errorMessage = '';
  activeStatus = 'offer'; // Default active tab
  jobCategory: string = 'Offers';
  currentUser: any = null;

  constructor(private resumeService: ResumeService, private jobOfferService: JobOfferService, private authService: Auth) { }

  ngOnInit(): void {
    this.loadJobOffers();
    this.loadAppliedJobs(); // Load applied jobs on init
    this.currentUser = this.authService.getCurrentUser();
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
        break;
      default:
        this.jobCategory = 'Offers';
    }
  }

  loadAppliedJobs(): void {
    this.resumeService.getUserApplications().subscribe({
      next: (data) => {
        this.appliedJobs = data.map((app: any) => ({
          ...app.job_offer,
          application_status: app.status, // Add application status
          applied_at: app.applied_at,     // Use applied_at from the API response
          resume_id: app.id,              // Add resume ID
          cover_letter: app.cover_letter  // Add cover letter if needed
        }));
        
        if (this.activeStatus === 'applied') {
          this.filteredJobs['applied'] = this.appliedJobs;
        }
      },
      error: (error) => {
        console.error('Error fetching applied jobs', error);
      }
    });
  }

  loadJobOffers(): void {
    this.loading = true;
    this.jobOfferService.getJobOffers().subscribe({
      next: (data) => {
        this.jobOffers = data;
        this.filterJobsByStatus();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load job offers. Please try again later.';
        this.loading = false;
        console.error('Error fetching job offers', error);
      }
    });
  }

  filterJobsByStatus(): void {
    this.statuses.forEach(status => {
      this.filteredJobs[status] = this.jobOffers.filter(jo => jo.status === status);
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
    this.jobOfferService.updateJobOffer(jobOffer.id!, this.prepareFormData(jobOffer))
      .subscribe({
        next: (updated) => {
          const index = this.jobOffers.findIndex(jo => jo.id === updated.id);
          if (index !== -1) {
            this.jobOffers[index] = updated;
            this.filterJobsByStatus();
          }
        },
        error: (error) => console.error('Error updating job offer', error)
      });
  }

  prepareFormData(jobOffer: JobOfferModel): FormData {
    const formData = new FormData();
    Object.keys(jobOffer).forEach(key => {
      if (jobOffer[key as keyof JobOfferModel] !== null && key !== 'company') {
        formData.append(key, jobOffer[key as keyof JobOfferModel]?.toString() ?? '');
      }
    });
    return formData;
  }
}