import {Component, OnInit} from '@angular/core';
import {HeaderContentComponent} from '../../../public/components/header-content/header-content.component';
import {Subscription} from '../../model/subscription.model';
import {ActivatedRoute, Router} from '@angular/router';
import {ProviderApiServiceService} from '../../services/provider-api.service.service';
import {Resident} from '../../model/resident.model';
import {ResidentApiServiceService} from '../../services/resident-api.service.service';
import {NgForOf} from '@angular/common';
import {SubscriptionApiServiceService} from '../../services/subscription-api.service.service';
import {Provider} from '../../model/provider.model';

import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-provider-summary',
  imports: [
    HeaderContentComponent,
    CommonModule, HeaderContentComponent, MatProgressSpinnerModule, MatTableModule, MatSortModule,
    MatPaginatorModule, MatFormFieldModule, MatInputModule
],
  templateUrl: './provider-summary.component.html',
  standalone: true,
  styleUrl: './provider-summary.component.css'
})

export class ProviderSummaryComponent implements OnInit{
  resident: Resident[] = []; // Array to hold residents

  subscriptionsDataSource = new MatTableDataSource<Resident>();
  subscriptions: { [residentId: number]: Subscription[] } = {};

  provider!: Provider;

  displayedColumns: string[] = ['id', 'firts_name', 'last_name', 'phone','status'];


  providerId!: number;

  constructor(
    private route: ActivatedRoute,
    private residentService: ResidentApiServiceService,
    private subscriptionService: SubscriptionApiServiceService,
    private providerService: ProviderApiServiceService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get provider_id from route parameters
    this.providerId = Number(this.route.snapshot.paramMap.get('id'));


    this.providerService.getProviderById(this.providerId).subscribe(
      provider => {
        this.provider = provider;
        console.log('Provider details:', this.provider);
      }
    );


    // Fetch residents by provider_id
    this.residentService.getAllResidentByProviderId(this.providerId).subscribe(
      (residents) => {
        const filteredResidents: Resident[] = [];
        residents.forEach((resident) => {
          if (resident.providerId === this.providerId) {
            filteredResidents.push(resident);
          }
        });
        this.resident = filteredResidents;
        this.subscriptionsDataSource.data = this.resident;
        console.log('Residentes filtrados:', filteredResidents);
      },
      (error) => {
        console.error('Error fetching residents:', error);
      }
    );
    this.residentService.getAllResidentByProviderId(this.providerId).subscribe(
      (residents) => {
        residents.forEach((resident) => {
          resident.status = 'active'; // Asignar estado activo
        });
        this.resident = residents;
        this.subscriptionsDataSource.data = this.resident;
        console.log('Residentes actualizados:', this.resident);
      },
      (error) => {
        console.error('Error fetching residents:', error);
      }
    );

  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'inactive':
        return 'status-inective';
      case 'active':
        return 'status-active';
      default:
        return '';
    }
  }

  goToProfile(): void {
    this.router.navigate([`/provider/${this.providerId}/profile`]);
  }
}
