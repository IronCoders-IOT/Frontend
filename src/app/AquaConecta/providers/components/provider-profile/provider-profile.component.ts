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
import {AuthService} from '../../../auth/application/services/auth.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { LanguageToggleComponent } from '../../../../shared/components/language-toggle/language-toggle.component';

@Component({
    selector: 'app-provider-profile',
    templateUrl: './provider-profile.component.html',
    styleUrls: ['./provider-profile.component.css'],
    standalone: true,    imports: [
        CommonModule,
        ReactiveFormsModule,
        HeaderContentComponent,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        TranslatePipe,
        LanguageToggleComponent
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
        private snackBar: MatSnackBar,
        private authService: AuthService
) { }

    ngOnInit(): void {
        // Get provider_id from route parameters
        this.providerId = Number(this.route.snapshot.paramMap.get('id'));
        this.initializeForm();
        this.loadProviderData();

    }

    private initializeForm(): void {
        this.profileForm = this.formBuilder.group({
            taxName: ['', [Validators.required, Validators.minLength(3)]],
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

    // Limpiar datos anteriores
    this.provider = new Provider();
    this.profileForm.reset();

    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (token && storedUser) {
      console.log('El token está almacenado:');
      const user = JSON.parse(storedUser || '{}');
      console.log('Usuario almacenado:', user);


      // If we have a provider ID in the route, use it to get that specific provider's profile
      if (user.id) {
        console.log('Usando ID de la ruta:', user.id);
        this.providerService.getProvidersProfile().subscribe({
          next: (profileData) => {
            this.provider = profileData;
            this.provider.sensors_number = this.provider.sensors_number || 0;
            console.log('Datos del perfil:', this.provider);
            this.populateForm();
          },
          error: (error) => {
            console.error('Error al obtener los datos del perfil:', error);
            this.loadError = true;
            this.snackBar.open('Failed to load profile data. Please try again.', 'Close', {
              duration: 5000,
              panelClass: 'error-snackbar'
            });
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      } else {
        // If no provider ID, get the current user's profile
        console.log('Usando perfil del usuario actual');
        this.providerService.getProvidersProfile().subscribe({
          next: (profileData) => {
            this.provider = profileData;
            this.provider.sensors_number = this.provider.sensors_number || 0;
            console.log('Datos del perfil:', this.provider);
            this.populateForm();
          },
          error: (error) => {
            console.error('Error al obtener los datos del perfil:', error);
            this.loadError = true;
            this.snackBar.open('Failed to load profile data. Please try again.', 'Close', {
              duration: 5000,
              panelClass: 'error-snackbar'
            });
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
    } else {
      console.log('No hay token o usuario almacenado en localStorage.');
      this.isLoading = false;
      this.snackBar.open('No token or user found. Please log in.', 'Close', {
        duration: 5000,
        panelClass: 'warning-snackbar'
      });
    }
  }

    private populateForm(): void {
        if (!this.provider) return;

        this.profileForm.patchValue({
            taxName: this.provider.taxName,
            ruc: this.provider.ruc,
            phone: this.provider.phone,
            // Use dummy data for fields not in the current model
            address: this.provider.direction,
            email: this.provider.email,
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
            taxName: this.profileForm.value.taxName,
            ruc: this.profileForm.value.ruc,
        };

      this.providerService.UpdateProvider(updatedProvider).subscribe({
        next: () => {
          this.provider = updatedProvider;
          this.isEditing = false;
          this.profileForm.disable();
          this.submitInProgress = false;

          console.log(updatedProvider)
          this.snackBar.open('Perfil del proveedor actualizado con éxito', 'Cerrar', {
            duration: 3000,
            panelClass: 'success-snackbar'
          });
        },
        error: (error) => {
          console.error('Error al actualizar el perfil del proveedor:', error);
          this.submitInProgress = false;

          this.snackBar.open('Error al guardar los cambios. Inténtalo nuevamente.', 'Cerrar', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
        }
      });
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
