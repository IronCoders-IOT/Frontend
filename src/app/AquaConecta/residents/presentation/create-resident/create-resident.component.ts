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

    // Verificar y debuggear el token
    const token = localStorage.getItem('auth_token');
    console.log('Token encontrado:', token ? 'SÍ' : 'NO');
    console.log('Token value:');

    if (!token) {
      console.error('No se encontró token de autenticación');
      this.router.navigate(['/login']);
      return;
    }

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

    // Crear instancia del modelo Resident
    const resident = new Resident(this.residentForm.value);

    const residentData = resident.toCreateRequest();

    console.log('Datos del residente:', residentData);

    this.residentService.createResident(residentData).subscribe({
      next: (resident) => {
        console.log('Respuesta del servidor:', resident);
        this.isSubmitting = false;
        this.snackBar.open('Resident created successfully', 'Close', {
          duration: 3000,
          verticalPosition: 'bottom',
          horizontalPosition: 'center',
          panelClass: ['custom-snackbar']
        });
        /*
        setTimeout(() => {
          this.router.navigate(['/residents']);
        }, 1000);
         */
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
