import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ResumeService } from '../../services/resume';
import { CommonModule, Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-job-applications',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
], // Add DragDropModule here],
  templateUrl: './job-applications.html',
  styleUrl: './job-applications.css'
})
// src/app/components/job-applications/job-applications.component.ts



export class JobApplications implements OnInit {
  jobOfferId: number = 0;
  applications: any[] = [];
  isLoading = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private resumeService: ResumeService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.jobOfferId = +this.route.snapshot.paramMap.get('id')!;
    this.loadApplications();
  }

  goBack(): void {
    this.location.back();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.resumeService.getApplicationsForJob(this.jobOfferId).subscribe(
      applications => {
        this.applications = applications;
        this.isLoading = false;
      },
      error => {
        this.error = 'Failed to load applications';
        this.isLoading = false;
      }
    );
  }

  downloadResume(applicationId: number): void {
    this.resumeService.downloadResume(applicationId).subscribe(
      blob => {
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      },
      error => {
        this.error = 'Failed to download resume';
      }
    );
  }

  updateStatus(applicationId: number, status: string): void {
    this.resumeService.updateApplicationStatus(applicationId, status).subscribe(
      () => {
        this.loadApplications(); // Refresh the list
      },
      error => {
        this.error = 'Failed to update status';
      }
    );
  }
}