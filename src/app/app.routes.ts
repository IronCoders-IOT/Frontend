import {Routes } from '@angular/router';
import {WaterRequestComponent} from './AquaConecta/requests/components/water-request/water-request.component';
import {HomeComponent} from './public/pages/home/home.component';
import { LoginComponent } from './AquaConecta/auth/presentation/pages/login/login.component';

export const routes: Routes = [
  {path:'', component: HomeComponent},
  {path: 'requests',component:WaterRequestComponent},
  {path: 'login', component: LoginComponent},
];


