import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-schedule-date',
  standalone: true,
  imports: [
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './schedule-date.component.html',
  styleUrls: ['./schedule-date.component.css'],
})
export class ScheduleDateComponent {
  selectedDate: Date | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ScheduleDateComponent>
  ) {}

  saveDate(selectedDate: Date): void {
    if (!selectedDate) {
      console.error('Por favor selecciona una fecha.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      console.error('La fecha seleccionada debe ser mayor a la fecha actual.');
      return;
    }

    console.log('Fecha seleccionada:', selectedDate);
    console.log('Datos de la fila:', this.data);

    // Aquí puedes realizar el POST o UPDATE a la base de datos
    this.dialogRef.close({ selectedDate, rowData: this.data });
  }
}