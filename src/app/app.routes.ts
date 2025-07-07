import { Routes } from '@angular/router';
import { HomeComponent } from './public/pages/home/home.component';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import {WaterRequestComponent} from './requests/components/water-request-list/water-request.component';
import {ProviderListComponent} from './providers/components/provider-list/provider-list.component';
import {ScheduleDateComponent} from './requests/components/schedule-date/schedule-date.component';
import {IssueReportListComponent} from './reports/components/issue-report-list/issue-report-list.component';
import {CreateResidentComponent} from './residents/presentation/create-resident/create-resident.component';
import {ResidentListComponent} from './residents/presentation/resident-list/resident-list.component';
import {ResidentSummaryComponent} from './residents/presentation/resident-summary/resident-summary.component';
import {ProviderSummaryComponent} from './providers/components/provider-summary/provider-summary.component';
import {ProviderItemComponent} from './providers/components/provider-item/provider-item.component';
import {SensorMonitoringComponent} from './providers/components/sensor-monitoring/sensor-monitoring.component';
import {LoginComponent} from './iam/presentation/pages/login/login.component';
import {SignupComponent} from './iam/presentation/pages/signup/signup.component';
import {IssueSummaryComponent} from './reports/components/issue-summary/issue-summary.component';
import {AdminDashboardComponent} from './analytics/presentation/dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path:'providers', component: ProviderListComponent},
  { path: 'requests', component: WaterRequestComponent },
  { path: 'schedule', component: ScheduleDateComponent },
  { path: 'login', component: LoginComponent },
  { path: 'reports', component: IssueReportListComponent},
  { path: 'signup', component: SignupComponent },
  { path: 'residents/create', component: CreateResidentComponent },
  {path: 'residents', component: ResidentListComponent},
  {path : 'residents/:id/details', component: ResidentSummaryComponent},
  { path: 'reports/:id', component: IssueSummaryComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'provider/:id', redirectTo: 'provider/:id/detail', pathMatch: 'full' },
  { path: 'provider/:id/detail', component: ProviderSummaryComponent },
  { path: 'provider/:id/profile', component: ProviderItemComponent },
  { path: 'sensor-monitoring', component: SensorMonitoringComponent },
  // Wildcard route for 404 page - must be last
  { path: '**', component: PageNotFoundComponent }
];
