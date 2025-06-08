import { Component, OnInit,ViewEncapsulation  } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HeaderContentComponent } from '../../../../public/components/header-content/header-content.component';
import {ResidentService} from '../../services/resident.service';
import {Resident} from '../../models/resident.model';

@Component({
  selector: 'app-create-resident',
  templateUrl: './create-resident.component.html',
  styleUrls: ['./create-resident.component.scss'],
  encapsulation: ViewEncapsulation.None, // Agregar esta línea
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HeaderContentComponent]
})
export class CreateResidentComponent implements OnInit {
  residentForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private residentService: ResidentService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.residentForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      documentType: ['', [Validators.required]],
      documentNumber: ['', [Validators.required]],
      direction: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });

    // Verificación más robusta de autenticación
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');

    console.log('=== VERIFICACIÓN DE AUTENTICACIÓN ===');
    console.log('Token encontrado:', token ? 'SÍ' : 'NO');
    console.log('Usuario encontrado:', user ? 'SÍ' : 'NO');
    console.log('Token length:', token ? token.length : 0);

    if (!token || !user) {
      console.error('Usuario no autenticado - redirigiendo al login');
      this.snackBar.open('Please log in to create residents', 'Close', {
        duration: 3000,
        verticalPosition: 'bottom',
        horizontalPosition: 'center'
      });
      this.router.navigate(['/login']);
      return;
    }

    try {
      const userData = JSON.parse(user);
      console.log('Datos del usuario:', userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      this.router.navigate(['/login']);
      return;
    }

    console.log('=== USUARIO AUTENTICADO CORRECTAMENTE ===');
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

  const resident = new Resident(this.residentForm.value);
  const residentData = resident.toCreateRequest();

  this.residentService.createResident(residentData).subscribe({
    next: () => {
      this.isSubmitting = false;

      this.snackBar.open('Resident created successfully', 'Close', {
        duration: 2000,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
        panelClass: ['custom-snackbar']
      });

      // 🔁 Redirige a /residents después del mensaje
      setTimeout(() => {
        this.router.navigate(['/residents']);
      }, 500); // puedes quitar el delay si no lo necesitas
    },
    error: (err) => {
      console.error('Error al crear el residente:', err);
      this.isSubmitting = false;

      this.snackBar.open('Error creating resident', 'Close', {
        duration: 3000,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
        panelClass: ['custom-snackbar']
      });
    }
  });
}
}
