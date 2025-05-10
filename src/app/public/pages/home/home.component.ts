import { Component } from '@angular/core';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  standalone: true,
  styleUrl: './home.component.css'
})
export class HomeComponent {
  tittle = 'AquaConecta';

  options = [
    {path: '/requests', name: 'Solicitud de Agua Potable'}
  ]

}
