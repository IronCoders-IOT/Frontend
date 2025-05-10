import { Component } from '@angular/core';
import {HeaderContentComponent} from '../../../../public/components/header-content/header-content.component';

@Component({
  selector: 'app-water-request',
  imports: [HeaderContentComponent],
  templateUrl: './water-request.component.html',
  standalone: true,
  styleUrl: './water-request.component.css'
})
export class WaterRequestComponent {
  tittle = 'Solicitud de Agua Potable';

}
