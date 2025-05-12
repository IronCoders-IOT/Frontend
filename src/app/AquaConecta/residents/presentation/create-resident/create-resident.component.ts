import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderContentComponent } from '../../../../public/components/header-content/header-content.component';

@Component({
  selector: 'app-create-resident',
  templateUrl: './create-resident.component.html',
  styleUrls: ['./create-resident.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderContentComponent]
})
export class CreateResidentComponent implements OnInit {
  residentForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.residentForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      documentType: ['', [Validators.required]],
      documentNumber: ['', [Validators.required]],
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
    if (this.residentForm.invalid) {
      this.residentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    // Simulación de envío de datos
    setTimeout(() => {
      console.log('Form data:', this.residentForm.value);
      this.isSubmitting = false;
      
      // Redirigir a la página deseada después de crear el residente
      this.router.navigate(['/residents']);
    }, 1000);
  }
}