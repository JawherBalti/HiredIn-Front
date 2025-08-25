import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon'; // <-- Add this
import { MatButtonModule } from '@angular/material/button'; // If using buttons
import { Auth } from '../services/auth';
import { RouterModule } from '@angular/router';
import { JobOfferService } from '../services/job-offer';
import { JobOfferModel } from '../models/job-offer.model';
import { DateAgoPipe } from '../date-ago-pipe';

@Component({
  selector: 'app-landing-page',
  standalone: true, // <-- This indicates a standalone component
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule, // <-- Add here
    MatButtonModule, // If using mat-button
    DateAgoPipe,
  ],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css'],
})
export class LandingPage implements OnInit {
  jobOffers: JobOfferModel[] = [];
  isLoading = false;

  constructor(
    private authService: Auth,
    private jobOfferService: JobOfferService
  ) {
    this.updateVisibleSlides();
    window.addEventListener('resize', () => this.updateVisibleSlides());
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.jobOfferService.getRecentJobOffers().subscribe({
      next: (offers) => {
        this.jobOffers = offers;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;

        console.log(err);
      },
    });
  }

  handleGetStarted() {
    this.authService.redirectBasedOnAuth('/job-offers', '/login');
  }

  handleQuickApply() {
    this.authService.redirectBasedOnAuth('/apply');
  }

  currentYear = new Date().getFullYear();
  currentSlide = 0;

  visibleSlides = 3; // Default number of visible slides

  updateVisibleSlides() {
    if (window.innerWidth < 768) {
      this.visibleSlides = 3;
    } else if (window.innerWidth < 992) {
      this.visibleSlides = 3;
    } else {
      this.visibleSlides = 3;
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.jobOffers.length;
  }

  prevSlide() {
    this.currentSlide =
      (this.currentSlide - 1 + this.jobOffers.length) % this.jobOffers.length;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  createRange(n: number): any[] {
    return Array.from({ length: n });
  }

  testimonials = [
    {
      text: 'This app completely transformed my job search. I went from disorganized to having multiple offers in weeks!',
      name: 'Sarah Johnson',
      title: 'Software Developer at TechCorp',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      text: 'The deadline reminders alone are worth it. Never missed an interview or follow-up again.',
      name: 'Michael Chen',
      title: 'UX Designer at DesignHub',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      text: 'As someone applying to 50+ jobs, keeping track was impossible before JobTrack. Game changer!',
      name: 'David Wilson',
      title: 'Product Manager at InnovateCo',
      avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    },
  ];
}
