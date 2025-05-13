import {Component, OnInit} from '@angular/core';
import {HeaderContentComponent} from '../../../../public/components/header-content/header-content.component';
import {Subscription} from '../../model/subscription.entity';
import {ActivatedRoute} from '@angular/router';
import {ProviderApiServiceService} from '../../services/provider-api.service.service';
import {Resident} from '../../model/resident.entity';
import {ResidentApiServiceService} from '../../services/resident-api.service.service';
import {NgForOf} from '@angular/common';
import {SubscriptionApiServiceService} from '../../services/subscription-api.service.service';

@Component({
  selector: 'app-provider-detail',
  imports: [
    HeaderContentComponent,
    NgForOf,
  ],
  templateUrl: './provider-detail.component.html',
  standalone: true,
  styleUrl: './provider-detail.component.css'
})

export class ProviderDetailComponent implements OnInit {
  resident: Resident[] = []; // Array to hold residents
  subscriptions: { [residentId: number]: Subscription[] } = {};


  providerId!: number;

  constructor(
    private route: ActivatedRoute,
    private residentService: ResidentApiServiceService,
    private subscriptionService: SubscriptionApiServiceService,
  ) {}

  ngOnInit(): void {
    // Get provider_id from route parameters
    this.providerId = Number(this.route.snapshot.paramMap.get('id'));

    // Fetch residents by provider_id
    this.residentService.getAllResidentByProviderId(this.providerId).subscribe(
      (resident) => {
        this.resident = resident; // Asignar los residentes obtenidos

        console.log(this.resident);

        this.resident.forEach((resident) => {
          this.subscriptionService.getSubscriptionsByResidentId(resident.id).subscribe(
            (subscriptions) => {
              this.subscriptions[resident.id] = subscriptions; // Almacenar suscripciones por residente
              console.log(`Subscriptions for resident ${resident.id}:`, subscriptions);
            },
            (error) => {
              console.error(`Error fetching subscriptions for resident ${resident.id}:`, error);
            }
          );
        });
      },
      (error) => {
        console.error('Error fetching residents:', error);
      }
    );
  }
}
