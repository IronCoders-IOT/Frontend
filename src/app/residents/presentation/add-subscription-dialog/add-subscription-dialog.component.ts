import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { environment } from '../../../../environments/environment';

export interface AddSubscriptionData {
  residentId: number;
}

@Component({
  selector: 'app-add-subscription-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe
  ],
  templateUrl: './add-subscription-dialog.component.html',
  styleUrls: ['./add-subscription-dialog.component.css']
})
export class AddSubscriptionDialogComponent {
  subscriptionForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<AddSubscriptionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddSubscriptionData,
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) {
    this.subscriptionForm = this.formBuilder.group({
      waterTankSize: ['', [Validators.required, Validators.min(1), Validators.pattern('^[0-9]+$')]]
    });
  }

  onSubmit(): void {
    if (this.subscriptionForm.valid) {
      this.isLoading = true;
      this.error = null;

      const subscriptionData = {
        residentId: this.data.residentId,
        waterTankSize: this.subscriptionForm.get('waterTankSize')?.value
      };

      // Obtener el token de autenticación
      const token = localStorage.getItem('auth_token');
      if (!token) {
        this.isLoading = false;
        this.error = 'No hay token de autenticación. Por favor, inicia sesión nuevamente.';
        return;
      }

      // Configurar headers con autorización
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });

      this.http.post(`${environment.serverBasePath}subscriptions`, subscriptionData, { headers })
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.dialogRef.close({ success: true, data: response });
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error al crear suscripción:', error);
            
            // Manejar diferentes tipos de errores
            if (error.status === 401) {
              this.error = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
            } else if (error.status === 400) {
              this.error = 'Datos inválidos. Verifica la información ingresada.';
            } else {
              this.error = 'Error al crear la suscripción. Por favor, inténtalo de nuevo.';
            }
          }
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.subscriptionForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('min')) {
      return 'El valor debe ser mayor a 0';
    }
    if (field?.hasError('pattern')) {
      return 'Solo se permiten números enteros';
    }
    return '';
  }
} 