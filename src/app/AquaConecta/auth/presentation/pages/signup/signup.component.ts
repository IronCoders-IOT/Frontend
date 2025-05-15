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
    errorMessage = '';

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
            confirmPassword: ['', [Validators.required]]
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

        const { email, password, name } = this.signupForm.value;

        this.authService.signup(email, password, name).subscribe({
            next: () => {
                // Navigate to the home page or dashboard after successful signup
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