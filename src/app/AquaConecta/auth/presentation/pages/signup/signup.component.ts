// signup.component.ts
import { Component, OnInit, Provider } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../application/services/auth.service';
import { ProviderApiServiceService } from '../../../../providers/services/provider-api.service.service';
import { AuthCredentials } from '../../../domain/models/auth-credentials.model';
import { User } from '../../../domain/models/user.model';

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
  currentStep = 1;
  totalSteps = 3;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private profileService: ProviderApiServiceService, // Assuming you have a profile service for user data
    private router: Router
  ) { }

  ngOnInit(): void {
    this.signupForm = this.formBuilder.group({
      // Step 1: Essential Info
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      
      // Step 2: Company Info
      companyName: ['', Validators.required],
      ruc: ['', Validators.required],
      documentType: ['', Validators.required],
      documentNumber: ['', Validators.required],
      
      // Step 3: Security & Address
      direction: [''], // Made optional
      password: ['', [Validators.required, Validators.minLength(1)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { 'passwordMismatch': true };
  }

  // Get current step fields for validation
  getCurrentStepFields(): string[] {
    switch (this.currentStep) {
      case 1:
        return ['name', 'lastName', 'email', 'phone'];
      case 2:
        return ['companyName', 'ruc', 'documentType', 'documentNumber'];
      case 3:
        return ['password', 'confirmPassword'];
      default:
        return [];
    }
  }

  // Validate current step
  validateCurrentStep(): boolean {
    const currentFields = this.getCurrentStepFields();
    let isValid = true;

    currentFields.forEach(fieldName => {
      const control = this.signupForm.get(fieldName);
      if (control) {
        control.markAsTouched();
        if (control.invalid) {
          isValid = false;
        }
      }
    });

    // Special validation for password confirmation in step 3
    if (this.currentStep === 3) {
      if (this.signupForm.hasError('passwordMismatch')) {
        isValid = false;
      }
    }

    return isValid;
  }

  // Navigation methods
  nextStep(): void {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Get progress percentage
  getProgressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  // Check if step is active
  isStepActive(step: number): boolean {
    return this.currentStep === step;
  }

  // Check if step dot should be active
  isStepDotActive(step: number): boolean {
    return step <= this.currentStep;
  }

  onSubmit(): void {
    if (!this.validateCurrentStep() || this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const { companyName, ruc, name, lastName, email, direction, password, documentNumber, documentType, phone } = this.signupForm.value;
    const roles = companyName ? ['ROLE_PROVIDER'] : [];
    const profileData = {
      email: email,
      direction: direction || '', // Handle optional field
      documentNumber: documentNumber,
      documentType: documentType,
      phone: phone,
      companyName: companyName,
      ruc: ruc,
      firstName: name,
      lastName: lastName
    };
    console.log('Datos enviados:', { username: name, password, roles, profileData });

    this.authService.signup(name, password, roles, profileData).subscribe({
      next: () => {
        this.successMessage = 'Cuenta registrada con éxito.';
        this.errorMessage = '';
        this.signupForm.reset();
        this.onLogin(); // Navigate to login after successful signup
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
    }, 3000);
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.signupForm.get(controlName);
    return !!(control && control.hasError(errorName) && control.touched);
  }

  // Check if field has any error
  isFieldInvalid(controlName: string): boolean {
    const control = this.signupForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}