import { Routes } from '@angular/router';
import { LandingPage } from './landing-page/landing-page';
import { Login } from './login/login';
import { Register } from './register/register';
import { JobOfferList } from './components/job-offer-list/job-offer-list';
import { JobOfferForm } from './components/job-offer-form/job-offer-form';
import { CompanyForm } from './components/company-form/company-form';
import { JobOfferDetails } from './components/job-offer-details/job-offer-details';
import { JobApplications } from './components/job-applications/job-applications';
import { ApplyToJob } from './components/apply-to-job/apply-to-job';
import { Notifications } from './components/notifications/notifications';
import { AuthGuard } from './guards/auth-guard';
import { CurrentUserJobOfferList } from './components/current-user-job-offer-list/current-user-job-offer-list';
import { CurrentUserCompanies } from './components/current-user-companies/current-user-companies';
import { AuthCallbackComponent } from './components/auth-callback/auth-callback';
import { SettingsComponent } from './components/settings/settings';

export const routes: Routes = [
    { path: '', component: LandingPage },
    { path: 'login', component: Login },
    { path: 'auth/callback', component: AuthCallbackComponent },
    { path: 'register', component: Register }, // Create this later
    { path: 'job-offers', component: JobOfferList, canActivate: [AuthGuard] },
    { path: 'job-offers/create', component: JobOfferForm, canActivate: [AuthGuard] },
    { path: 'job-offers/:id/edit', component: JobOfferForm, canActivate: [AuthGuard] },
    { path: 'company/create', component: CompanyForm, canActivate: [AuthGuard] },
    { path: 'company/:id/edit', component: CompanyForm, canActivate: [AuthGuard] },
    { path: 'job-offers/:id', component: JobOfferDetails, canActivate: [AuthGuard] },
    { path: 'jobs/:id/apply', component: ApplyToJob, canActivate: [AuthGuard] },
    { path: 'jobs/:id/applications', component: JobApplications, canActivate: [AuthGuard] },
    { path: 'notifications', component: Notifications, canActivate: [AuthGuard]},
    { path: 'current-user-job-offers', component: CurrentUserJobOfferList, canActivate: [AuthGuard]},
    { path: 'companies', component: CurrentUserCompanies, canActivate: [AuthGuard]},
      { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },

//   { path: 'apply', component: ApplyComponent, canActivate: [AuthGuard]  }, // Create this later
//   { 
//     path: 'dashboard', 
//     component: DashboardComponent,
//     canActivate: [AuthGuard] 
//   },
];
