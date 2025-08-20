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

export const routes: Routes = [
    { path: '', component: LandingPage },
    { path: 'login', component: Login },
    { path: 'register', component: Register }, // Create this later
    { path: 'job-offers', component: JobOfferList, canActivate: [AuthGuard] },
    { path: 'job-offers/create', component: JobOfferForm, canActivate: [AuthGuard] },
    { path: 'company/create', component: CompanyForm, canActivate: [AuthGuard] },
    { path: 'job-offers/:id/edit', component: JobOfferForm, canActivate: [AuthGuard] },
    { path: 'job-offers/:id', component: JobOfferDetails, canActivate: [AuthGuard] },
    { path: 'jobs/:id/apply', component: ApplyToJob, canActivate: [AuthGuard] },
    { path: 'jobs/:id/applications', component: JobApplications, canActivate: [AuthGuard] },
    { path: 'notifications', component: Notifications, canActivate: [AuthGuard]}
//   { path: 'apply', component: ApplyComponent, canActivate: [AuthGuard]  }, // Create this later
//   { 
//     path: 'dashboard', 
//     component: DashboardComponent,
//     canActivate: [AuthGuard] 
//   },
];
