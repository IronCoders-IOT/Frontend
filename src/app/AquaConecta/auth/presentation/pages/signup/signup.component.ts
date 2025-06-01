import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../application/services/auth.service';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule]
})
export class SignupComponent implements OnInit {
    signupForm!: FormGroup;
    isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  isProviderRole = false;
  isAdminRole = false;

  onRoleChange(event: Event): void {
    const selectedRole = (event.target as HTMLSelectElement).value;
    this.isProviderRole = selectedRole === 'ROLE_PROVIDER';
    this.isAdminRole = selectedRole === 'ROLE_ADMIN';

    if (this.isProviderRole) {
      this.signupForm.get('name')?.clearValidators();
      this.signupForm.get('companyName')?.setValidators([Validators.required]);
    } else {
      this.signupForm.get('name')?.setValidators([Validators.required]);
      this.signupForm.get('companyName')?.clearValidators();
    }

    // Actualiza el estado de los controles después de cambiar las validaciones
    this.signupForm.get('name')?.updateValueAndValidity();
    this.signupForm.get('companyName')?.updateValueAndValidity();
  }
    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.signupForm = this.formBuilder.group({
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]],
            roles: ['', [Validators.required]], // Nuevo campo para roles

          lastName: [''],
          direction: [''],
          documentNumber: [''],
          documentType: [''],
          phone: [''],
          ruc: [''],         // Campo para el rol de Provider
          companyName: [''] // Campo para el rol de Provider

        }, { validator: this.passwordMatchValidator });
    }

    passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
        const password = group.get('password')?.value;
        const confirmPassword = group.get('confirmPassword')?.value;

        return password === confirmPassword ? null : { 'passwordMismatch': true };
    }

    onSubmit(): void {
        if (this.signupForm.invalid) {
            this.signupForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';

      const { email, password, name, roles, direction, documentNumber, documentType, phone, lastName,ruc, companyName } = this.signupForm.value;

      const profileData = {
        email: email,
        direction: direction,
        documentNumber: roles === 'ROLE_PROVIDER' ? ruc : documentNumber,
        documentType: roles === 'ROLE_PROVIDER' ? 'RUC' : documentType,
        phone: phone,
        ...(roles === 'ROLE_PROVIDER' ? {
          firstName: companyName,
          lastName: companyName,
          companyName: companyName,
          ruc: ruc // Asegúrate de que este campo esté en el formulario
        } : {
          firstName: name,
          lastName: lastName
        })
      };

      this.authService.signup(profileData.firstName, password, [roles],profileData).subscribe({
            next: () => {
                // Navigate to the home page or dashboard after successful signup
                this.successMessage = 'Cuenta registrada con éxito.';
                this.errorMessage = '';
                this.signupForm.reset(); // Resetea el formulario

                this.router.navigate(['/home']);
            },
            error: (error: Error) => {
                this.errorMessage = error.message || 'Registration failed. Please try again.';
                this.isSubmitting = false;
            },
            complete: () => {
                this.isSubmitting = false;
            }
        });
    }

    onLogin(): void {
        this.router.navigate(['/login']);
    }

    hasError(controlName: string, errorName: string): boolean {
        const control = this.signupForm.get(controlName);
        return !!(control && control.hasError(errorName) && control.touched);
    }
}
