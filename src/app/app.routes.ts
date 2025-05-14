import { Routes } from '@angular/router';
import { WaterRequestComponent } from './AquaConecta/requests/components/water-request/water-request.component';
import { HomeComponent } from './public/pages/home/home.component';
import { LoginComponent } from './AquaConecta/auth/presentation/pages/login/login.component';
import { SignupComponent } from './AquaConecta/auth/presentation/pages/signup/signup.component';
import { CreateResidentComponent } from './AquaConecta/residents/presentation/create-resident/create-resident.component';
import {ScheduleDateComponent} from './AquaConecta/requests/components/schedule-date/schedule-date.component';
import {ResidentListComponent} from './AquaConecta/residents/presentation/resident-list/resident-list.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'requests', component: WaterRequestComponent },
  { path: 'schedule', component: ScheduleDateComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'residents/create', component: CreateResidentComponent },
  { path: 'residents', component: ResidentListComponent },
  //{ path: 'residents', redirectTo: '/residents/create', pathMatch: 'full' }
];
