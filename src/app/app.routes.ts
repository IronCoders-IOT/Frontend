import {Routes } from '@angular/router';
import {WaterRequestComponent} from './AquaConecta/requests/components/water-request/water-request.component';
import {HomeComponent} from './public/pages/home/home.component';

export const routes: Routes = [
  {path:'', component: HomeComponent},
  {path: 'requests',component:WaterRequestComponent,}
];


