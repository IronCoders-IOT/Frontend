import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {HeaderContentComponent} from '../../../../public/components/header-content/header-content.component';
import {MatInputModule} from '@angular/material/input';

import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { MatDatepickerModule} from '@angular/material/datepicker';
import {FormsModule} from '@angular/forms';
import {MatNativeDateModule} from '@angular/material/core';

import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

@Component({
  selector: 'app-schedule-date',
  imports: [
    HeaderContentComponent,
    MatInputModule, MatCardModule, MatButtonModule,MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    FormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './schedule-date.component.html',
  standalone: true,
  styleUrl: './schedule-date.component.css'
})
export class ScheduleDateComponent {

  supplay_request: Date | null = null;

  readonly dialog = inject(MatDialog);

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(DialogAnimationsExampleDialog, {
      width: '550px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }

  saveDate() {
    const today = new Date();
    if (this.supplay_request) {
      // Elimina la hora de la fecha actual para comparar solo las fechas
      today.setHours(0, 0, 0, 0);

      if (this.supplay_request <= today) {
        console.error('La fecha seleccionada debe ser mayor a la fecha actual.');
        return;
      }

      console.log('Selected Date:', this.supplay_request);
      // Aquí puedes realizar el POST o UPDATE a la base de datos
    } else {
      console.error('Por favor selecciona una fecha.');
    }
  }
}

@Component({
  selector: 'dialog-animations-dialog',
  templateUrl: './dialog-animation-dialog.html',
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class DialogAnimationsExampleDialog {
  readonly dialogRef = inject(MatDialogRef<DialogAnimationsExampleDialog>);
}
