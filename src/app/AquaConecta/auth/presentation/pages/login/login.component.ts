import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../application/services/auth.service';
import { AuthCredentials } from '../../../domain/models/auth-credentials.model';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule]
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    isSubmitting = false;
    errorMessage = '';

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';

        const credentials = new AuthCredentials(
            this.loginForm.value.email,
            this.loginForm.value.password
        );

        this.authService.login(credentials).subscribe({
            next: () => {
                // Navigate to the home page or dashboard after successful login
                this.router.navigate(['/home']);
            },
            // Fix: Add explicit type for the error parameter
            error: (error: Error) => {
                this.errorMessage = error.message || 'Login failed. Please check your credentials.';
                this.isSubmitting = false;
            },
            complete: () => {
                this.isSubmitting = false;
            }
        });
    }

    onSignup(): void {
        this.router.navigate(['/signup']);
    }

    get email() { return this.loginForm.get('email'); }
    get password() { return this.loginForm.get('password'); }

    hasError(controlName: string, errorName: string): boolean {
        const control = this.loginForm.get(controlName);
        return !!(control && control.hasError(errorName) && control.touched);
    }
}