import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-schedule-date',
  standalone: true,
  templateUrl: './schedule-date.component.html',
  styleUrls: ['./schedule-date.component.css'],
})
export class ScheduleDateComponent {
  selectedDate: Date | null = null; // Propiedad para almacenar la fecha seleccionada

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any, // Datos pasados al modal
    public dialogRef: MatDialogRef<ScheduleDateComponent> // Referencia al modal
  ) {}

  /**
   * Método para manejar el cambio de fecha en el campo de entrada.
   */
onDateChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.value) {
    const [year, month, day] = input.value.split('-').map(Number);
    this.selectedDate = new Date(year, month - 1, day); // Meses en JavaScript son 0-indexados
  } else {
    this.selectedDate = null;
  }
  console.log('Fecha seleccionada:', this.selectedDate);
}

  /**
   * Cierra el modal sin guardar cambios.
   */
  closeModal(): void {
    this.dialogRef.close();
  }

  /**
   * Valida la fecha seleccionada y cierra el modal devolviendo los datos.
   */
  saveDate(): void {
    if (!this.selectedDate) {
      console.error('Por favor selecciona una fecha.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (this.selectedDate <= today) {
      console.error('La fecha seleccionada debe ser mayor a la fecha actual.');
      return;
    }

    console.log('Fecha seleccionada:', this.selectedDate);
    console.log('Datos de la fila:', this.data);

    // Simula el guardado devolviendo los datos al componente padre
    this.dialogRef.close({ selectedDate: this.selectedDate, rowData: this.data });
  }
}