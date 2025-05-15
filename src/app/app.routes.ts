import { Routes } from '@angular/router';
import { WaterRequestComponent } from './AquaConecta/requests/components/water-request/water-request.component';
import { HomeComponent } from './public/pages/home/home.component';
import { LoginComponent } from './AquaConecta/auth/presentation/pages/login/login.component';
import { SignupComponent } from './AquaConecta/auth/presentation/pages/signup/signup.component';
import { CreateResidentComponent } from './AquaConecta/residents/presentation/create-resident/create-resident.component';
import { ScheduleDateComponent} from './AquaConecta/requests/components/schedule-date/schedule-date.component';
import { ReportRequestComponent} from './AquaConecta/reports/components/report-request/report-request.component';
import { ProviderDetailComponent} from './AquaConecta/providers/components/provider-detail/provider-detail.component';
import { ProviderListComponent} from './AquaConecta/providers/components/provider-list/provider-list.component';
import { ViewHistoryComponent } from './AquaConecta/residents/presentation/view-history/view-history.component';
import { ReportDetailComponent } from './AquaConecta/reports/components/report-detail/report-detail/report-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path:'providers', component: ProviderListComponent},
  { path: 'provider/:id', redirectTo: 'provider/:id/detail', pathMatch: 'full' },
  { path: 'provider/:id/detail', component: ProviderDetailComponent },
  { path: 'requests', component: WaterRequestComponent },
  { path: 'schedule', component: ScheduleDateComponent },
  { path: 'login', component: LoginComponent },
  { path: 'reports', component: ReportRequestComponent},
  { path: 'signup', component: SignupComponent },
  { path: 'residents/create', component: CreateResidentComponent },
  { path: 'residents', redirectTo: '/residents/create', pathMatch: 'full' },
  {path : 'history', component: ViewHistoryComponent},
  { path: 'reports/:id', component: ReportDetailComponent },
];

