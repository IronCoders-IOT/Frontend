import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../application/services/auth.service';
import { AuthCredentials } from '../../../domain/models/auth-credentials.model';
import { User } from '../../../domain/models/user.model';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';

interface Particle {
  x: number;
  delay: number;
  duration: number;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  showPassword = false;
  focusedField: string | null = null;
  particles: Particle[] = [];
  
  private animationFrame: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private translationService: TranslationService
  ) {
    this.generateParticles();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.startParticleAnimation();
  }

  ngOnDestroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.minLength(1)]]
    });

    // Listen to form changes to clear errors
    this.loginForm.valueChanges.subscribe(() => {
      if (this.errorMessage) {
        this.errorMessage = '';
      }
    });
  }

  private generateParticles(): void {
    const particleCount = 30;
    this.particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * 100,
        delay: Math.random() * 20,
        duration: Math.random() * 10 + 15
      });
    }
  }

  private startParticleAnimation(): void {
    const animate = () => {
      // Update particle positions if needed
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  onFieldFocus(fieldName: string): void {
    this.focusedField = fieldName;
  }

  onFieldBlur(): void {
    this.focusedField = null;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.shakeForm();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const credentials = new AuthCredentials(
      this.loginForm.value.username,
      this.loginForm.value.password
    );

    // Add a small delay to show the loading state
    setTimeout(() => {
      this.authService.login(credentials).subscribe({
        next: (user: User) => {
          console.log('Usuario autenticado:', user);
          this.handleSuccessfulLogin(credentials);
        },
        error: (error: any) => {
          this.handleLoginError(error);
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    }, 500);
  }

  private handleSuccessfulLogin(credentials: AuthCredentials): void {
    // Show success feedback
    this.showSuccessMessage();
    
    // Navigate based on user type
    setTimeout(() => {
      if (credentials.email === "admin") {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.router.navigate(['/home']);
      }
    }, 1000);
  }

  private handleLoginError(error: any): void {
    this.errorMessage = error.message || 'Error de inicio de sesión. Por favor verifica tus credenciales.';
    this.shakeForm();
    
    // Auto-hide error message after 5 seconds
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  private showSuccessMessage(): void {
    // You can implement a success toast or animation here
    console.log('Login successful!');
  }

  private shakeForm(): void {
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
      formContainer.classList.add('shake');
      setTimeout(() => {
        formContainer.classList.remove('shake');
      }, 500);
    }
  }

  onSignup(): void {
    this.router.navigate(['/signup']);
  }

  // Getter methods for form controls
  get username() { 
    return this.loginForm.get('username'); 
  }

  get password() { 
    return this.loginForm.get('password'); 
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.hasError(errorName) && control.touched);
  }

  // Utility methods for better UX
  isFieldValid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.valid && field.touched);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Method to handle Enter key press
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !this.isSubmitting) {
      this.onSubmit();
    }
  }

  // Method to clear specific field error
  clearFieldError(fieldName: string): void {
    const field = this.loginForm.get(fieldName);
    if (field) {
      field.setErrors(null);
    }
  }

  // Method to validate form in real-time
  validateField(fieldName: string): void {
    const field = this.loginForm.get(fieldName);
    if (field) {
      field.markAsTouched();
      field.updateValueAndValidity();
    }
  }

  // Method to handle form animations
  animateElement(element: HTMLElement, animationClass: string): void {
    element.classList.add(animationClass);
    setTimeout(() => {
      element.classList.remove(animationClass);
    }, 500);
  }

  // Method to reset form
  resetForm(): void {
    this.loginForm.reset();
    this.errorMessage = '';
    this.showPassword = false;
    this.focusedField = null;
  }

  // Method to handle social login (if needed in future)
  onSocialLogin(provider: string): void {
    console.log(`Social login with ${provider}`);
    // Implement social login logic here
  }

  // Method to handle forgot password
  onForgotPassword(): void {
    console.log('Forgot password clicked');
    // Navigate to forgot password page or show modal
    // this.router.navigate(['/forgot-password']);
  }
}