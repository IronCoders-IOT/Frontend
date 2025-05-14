import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderContentComponent } from '../../../../public/components/header-content/header-content.component';
import { ProviderApiServiceService } from '../../services/provider-api.service.service';
import { Provider } from '../../model/provider.entity';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-provider-profile',
  templateUrl: './provider-profile.component.html',
  styleUrls: ['./provider-profile.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderContentComponent,
    MatSnackBarModule
  ]
})
export class ProviderProfileComponent implements OnInit {
  profileForm!: FormGroup;
  provider!: Provider;
  providerId!: number;
  isEditing: boolean = false;
  isLoading: boolean = true;
  submitInProgress: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private providerService: ProviderApiServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Get provider_id from route parameters
    this.providerId = Number(this.route.snapshot.paramMap.get('id'));
    this.initializeForm();
    this.loadProviderData();
  }

  private initializeForm(): void {
    this.profileForm = this.formBuilder.group({
      tax_name: ['', [Validators.required]],
      ruc: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      address: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      sensors_number: [0, [Validators.min(0)]]
    });
  }

  private loadProviderData(): void {
    this.isLoading = true;
    this.providerService.getProviderById(this.providerId).subscribe({
      next: (provider) => {
        this.provider = provider;
        this.populateForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching provider details:', error);
        this.isLoading = false;
        this.snackBar.open('Failed to load provider data', 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  private populateForm(): void {
    this.profileForm.patchValue({
      tax_name: this.provider.tax_name,
      ruc: this.provider.ruc,
      phone: this.provider.phone,
      // Use dummy data for fields not in the current model
      address: '123 Water St, Lima, Peru',
      email: 'provider@aquaconecta.com',
      sensors_number: this.provider.sensors_number
    });
    this.profileForm.disable(); // Initially disable form for view mode
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
      this.populateForm(); // Reset form to original values when canceling edit
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.submitInProgress = true;
    
    // Create updated provider object from form values
    const updatedProvider: Provider = {
      ...this.provider,
      tax_name: this.profileForm.value.tax_name,
      ruc: this.profileForm.value.ruc,
      phone: this.profileForm.value.phone,
      sensors_number: this.profileForm.value.sensors_number
    };

    // In a real scenario, you would update the provider via API
    setTimeout(() => {
      // Simulate API call
      this.provider = updatedProvider;
      this.isEditing = false;
      this.profileForm.disable();
      this.submitInProgress = false;
      
      this.snackBar.open('Provider profile updated successfully', 'Close', {
        duration: 3000,
        panelClass: 'success-snackbar'
      });
    }, 1500);
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.profileForm.get(controlName);
    return !!(control && control.hasError(errorName) && control.touched);
  }

  goToDetails(): void {
    this.router.navigate([`/provider/${this.providerId}/detail`]);
  }
}