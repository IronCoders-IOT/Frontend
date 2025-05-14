// provider-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderContentComponent } from '../../../../public/components/header-content/header-content.component';
import { ProviderApiServiceService } from '../../services/provider-api.service.service';
import { Provider } from '../../model/provider.entity';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, finalize, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-provider-profile',
    templateUrl: './provider-profile.component.html',
    styleUrls: ['./provider-profile.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        HeaderContentComponent,
        MatSnackBarModule,
        MatProgressSpinnerModule
    ]
})
export class ProviderProfileComponent implements OnInit {
    profileForm!: FormGroup;
    provider!: Provider;
    providerId!: number;
    isEditing: boolean = false;
    isLoading: boolean = true;
    submitInProgress: boolean = false;
    loadError: boolean = false;

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
            tax_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            ruc: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
            phone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
            address: ['', [Validators.required, Validators.minLength(5)]],
            email: ['', [Validators.required, Validators.email]],
            sensors_number: [0, [Validators.required, Validators.min(0)]]
        });
    }

    private loadProviderData(): void {
        this.isLoading = true;
        this.loadError = false;
        
        this.providerService.getProviderById(this.providerId)
            .pipe(
                tap(provider => {
                    this.provider = provider;
                    this.populateForm();
                }),
                catchError(error => {
                    console.error('Error fetching provider details:', error);
                    this.loadError = true;
                    this.snackBar.open('Failed to load provider data. Please try again.', 'Close', {
                        duration: 5000,
                        panelClass: 'error-snackbar'
                    });
                    return of(null);
                }),
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe();
    }

    private populateForm(): void {
        if (!this.provider) return;
        
        this.profileForm.patchValue({
            tax_name: this.provider.tax_name,
            ruc: this.provider.ruc,
            phone: this.provider.phone,
            // Use dummy data for fields not in the current model
            address: '123 Water St, Lima, Peru',
            email: 'contact@' + this.provider.tax_name.toLowerCase().replace(/\s+/g, '-') + '.com',
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
            this.markFormGroupTouched(this.profileForm);
            this.snackBar.open('Please correct the errors in the form', 'Close', {
                duration: 3000,
                panelClass: 'warning-snackbar'
            });
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
        // For now, let's simulate an API call with timeout
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
        this.router.navigate([`/provider/${this.providerId}`]);
    }

    // Utility function to mark all controls in a form group as touched
    private markFormGroupTouched(formGroup: FormGroup) {
        Object.values(formGroup.controls).forEach(control => {
            control.markAsTouched();
            
            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }

    retry(): void {
        this.loadProviderData();
    }
}