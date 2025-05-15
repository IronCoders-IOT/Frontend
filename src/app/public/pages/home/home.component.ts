import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  standalone: true,
  styleUrl: './home.component.css'
})
export class HomeComponent {
  title = 'AquaConecta';

  options = [
    {path: '/requests', name: 'Solicitud de Agua Potable'},
    {path: '/login', name: 'Iniciar Sesión'},
    {path: '/signup', name: 'Registrarse'},
    {path: '/report', name: 'Lista de Reportes'},
    {path: '/providers', name: 'Lista de provedores'},
    {path: '/provider', name: 'Detalles del proveedor'},
  ];
}
