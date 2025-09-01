import { Component, OnInit } from '@angular/core';
import { CompanyService } from '../../services/company';
import { CompanyModel } from '../../models/company.model';
import { CommonModule, Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DateAgoPipe } from '../../date-ago-pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-current-user-companies',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    DateAgoPipe,
    RouterLink,
  ], // Add this line  ],
  templateUrl: './current-user-companies.html',
  styleUrl: './current-user-companies.css',
})
export class CurrentUserCompanies implements OnInit {
  companies: CompanyModel[] = [];
  loading = false;

  constructor(
    private companyService: CompanyService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.loading = true;
    this.companyService.getCurrentUserCompanies().subscribe({
      next: (data) => {
        this.companies = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
      },
    });
  }

  goBack(): void {
    this.location.back();
  }
}
