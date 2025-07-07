import { Routes } from '@angular/router';
import { HomeComponent } from './public/pages/home/home.component';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';
import {WaterRequestComponent} from './requests/components/water-request-item/water-request.component';
import {ProviderListComponent} from './providers/components/provider-list/provider-list.component';
import {ScheduleDateComponent} from './requests/components/schedule-date/schedule-date.component';
import {ReportRequestComponent} from './reports/components/issue-report/report-request.component';
import {CreateResidentComponent} from './residents/presentation/create-resident/create-resident.component';
import {ResidentListComponent} from './residents/presentation/resident-list/resident-list.component';
import {ViewHistoryComponent} from './residents/presentation/resident-summary/view-history.component';
import {ProviderDetailComponent} from './providers/components/provider-summary/provider-detail.component';
import {ProviderProfileComponent} from './providers/components/provider-item/provider-profile.component';
import {SensorMonitoringComponent} from './providers/components/sensor-monitoring/sensor-monitoring.component';
import {LoginComponent} from './iam/presentation/pages/login/login.component';
import {SignupComponent} from './iam/presentation/pages/signup/signup.component';
import {ReportDetailComponent} from './reports/components/issue-summary/report-detail.component';
import {AdminDashboardComponent} from './analytics/presentation/dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path:'providers', component: ProviderListComponent},
  { path: 'requests', component: WaterRequestComponent },
  { path: 'schedule', component: ScheduleDateComponent },
  { path: 'login', component: LoginComponent },
  { path: 'reports', component: ReportRequestComponent},
  { path: 'signup', component: SignupComponent },
  { path: 'residents/create', component: CreateResidentComponent },
  {path: 'residents', component: ResidentListComponent},
  {path : 'residents/:id/details', component: ViewHistoryComponent},
  { path: 'reports/:id', component: ReportDetailComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'provider/:id', redirectTo: 'provider/:id/detail', pathMatch: 'full' },
  { path: 'provider/:id/detail', component: ProviderDetailComponent },
  { path: 'provider/:id/profile', component: ProviderProfileComponent },
  { path: 'sensor-monitoring', component: SensorMonitoringComponent },
  // Wildcard route for 404 page - must be last
  { path: '**', component: PageNotFoundComponent }
];
