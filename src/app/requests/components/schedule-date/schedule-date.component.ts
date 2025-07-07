import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-schedule-date',
  standalone: true,
  templateUrl: './schedule-date.component.html',
  styleUrls: ['./schedule-date.component.css'],
  imports: [FormsModule, DatePipe, TranslatePipe]
})
export class ScheduleDateComponent implements OnInit {
  deliveredDateString: string = ''; // Para el ngModel del input date
  selectedDate: Date | null = null; // Fecha como objeto Date
  status: string = ''; // Estado inicial

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ScheduleDateComponent>,
    private snackBar: MatSnackBar

) {}

  /**
   * Inicializa valores si vienen desde el componente padre.
   */
  ngOnInit(): void {
    if (this.data?.delivered_at) {
      const date = new Date(this.data.delivered_at);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      this.deliveredDateString = `${yyyy}-${mm}-${dd}`;
      this.selectedDate = date;
    }

    this.status = this.data?.status || 'PENDING'; // Estado por defecto
  }

  /**
   * Maneja el cambio en el campo de fecha.
   */
  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.deliveredDateString = input.value;

    if (input.value) {
      const [year, month, day] = input.value.split('-').map(Number);
      this.selectedDate = new Date(year, month - 1, day);

      /*
      // Cambiar estado automáticamente si es válido
      if (this.status != 'PENDING') {
        this.status = 'IN_PROGRESS';
      }
      */

    } else {
      this.selectedDate = null;
    }

    console.log('Fecha seleccionada:', this.selectedDate);
  }

  /**
   * Cierra el modal sin guardar.
   */
  closeModal(): void {
    this.dialogRef.close();
  }

  /**
   * Guarda y devuelve los datos si la fecha es válida.
   */
  saveDate(): void {
    if (!this.selectedDate) {
      console.error('Por favor selecciona una fecha.');
      this.snackBar.open('Por favor selecciona una fecha.', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (this.selectedDate <= today) {
      console.error('La fecha seleccionada debe ser mayor a la fecha actual.');
      this.snackBar.open('La fecha seleccionada debe ser mayor a la fecha actual.', 'Cerrar', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    console.log('Fecha guardada:', this.selectedDate);
    console.log('Estado:', this.status);

    this.dialogRef.close({
      selectedDate: this.selectedDate,
      status: this.status,
      rowData: this.data
    });
  }
}
