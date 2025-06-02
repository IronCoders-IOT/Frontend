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

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
      this.signupForm = this.formBuilder.group({
        companyName: ['', Validators.required],
        ruc: ['', Validators.required],
        name: ['', Validators.required], // Manteniendo 'name' como en tu código original
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        direction: ['', Validators.required],
        documentNumber: ['', Validators.required],
        documentType: ['', Validators.required],
        phone: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      }, { validators: this.passwordMatchValidator });
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

      const { companyName, ruc, name, lastName, email, direction, password, documentNumber, documentType, phone } = this.signupForm.value;

      const roles = companyName ? ['ROLE_PROVIDER'] : [];

      const profileData = {
        email: email,
        direction: direction,
        documentNumber: documentNumber,
        documentType:documentType,
        phone: phone,
        companyName: companyName,
        ruc: ruc,
        firstName: name, // Mapeando 'name' a 'firstName'
        lastName: lastName
      };
      console.log('Datos enviados:', { username: name, password, roles, profileData });

      this.authService.signup(name, password, roles, profileData).subscribe({
            next: () => {
                // Navigate to the home page or dashboard after successful signup
                this.successMessage = 'Cuenta registrada con éxito.';
                this.errorMessage = '';
                this.signupForm.reset(); // Resetea el formulario


                this.onLogin();
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
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000); // Retraso de 3 segundos
    }

    hasError(controlName: string, errorName: string): boolean {
        const control = this.signupForm.get(controlName);
        return !!(control && control.hasError(errorName) && control.touched);
    }
}
