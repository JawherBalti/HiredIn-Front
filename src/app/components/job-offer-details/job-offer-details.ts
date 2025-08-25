import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { JobOfferService } from '../../services/job-offer';
import { JobOfferModel } from '../../models/job-offer.model';
import { CommonModule, Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Auth } from '../../services/auth';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ApplyJobDialogComponent } from '../apply-job-dialog/apply-job-dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-job-offer-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ], // Add DragDropModule here],
  templateUrl: './job-offer-details.html',
  styleUrls: ['./job-offer-details.css'],
})
export class JobOfferDetails implements OnInit {
  jobOffer: JobOfferModel | null = null;
  currentUser: any = null;
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private jobOfferService: JobOfferService,
    private router: Router,
    private location: Location,
    private authService: Auth,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadJobOffer();
    this.currentUser = this.authService.getCurrentUser();
  }

  loadJobOffer(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'No job offer ID provided';
      this.loading = false;
      return;
    }

    this.jobOfferService.getJobOfferById(+id).subscribe({
      next: (data) => {
        this.jobOffer = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load job offer details';
        this.loading = false;
        console.error('Error fetching job offer', error);
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  editJobOffer(): void {
    if (this.jobOffer?.id) {
      this.router.navigate(['/job-offers', this.jobOffer.id, 'edit']);
    }
  }

  // Replace the apply button click handler
  openApplyModal(): void {
    const dialogRef = this.dialog.open(ApplyJobDialogComponent, {
      width: '600px',
      data: { jobOfferId: this.jobOffer!.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.errorMessage = ''; // Reset any previous error message
      } else if (result?.success === false) {
        this.errorMessage = 'Application failed. Please try again.';
      }
    });
  }
}
