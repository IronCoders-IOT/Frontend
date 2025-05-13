import { Routes } from '@angular/router';
import { HomeComponent } from './public/pages/home/home.component';
import { LoginComponent } from './AquaConecta/auth/presentation/pages/login/login.component';
import { SignupComponent } from './AquaConecta/auth/presentation/pages/signup/signup.component';
import { CreateResidentComponent } from './AquaConecta/residents/presentation/create-resident/create-resident.component';
import {ProviderListComponent} from './AquaConecta/providers/components/provider-list/provider-list.component';
import {ProviderDetailComponent} from './AquaConecta/providers/components/provider-detail/provider-detail.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  //{ path: 'requests', component: WaterRequestComponent },
  //{ path: 'schedule', component: ScheduleDateComponent },
  { path:'providers', component: ProviderListComponent},
  { path:'provider/:id', component: ProviderDetailComponent},
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'residents/create', component: CreateResidentComponent },
  { path: 'residents', redirectTo: '/residents/create', pathMatch: 'full' }
];
