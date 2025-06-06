import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderContentComponent } from '../../components/header-content/header-content.component';
import { HttpClient } from '@angular/common/http';
import {SensordataApiService} from '../../../AquaConecta/requests/services/sensordata-api.service';
import {ResidentService} from '../../../AquaConecta/residents/services/resident.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule, HeaderContentComponent],
  templateUrl: './home.component.html',
  standalone: true,
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  title = 'AquaConecta';
  username: string | null = null;
  userRole: string | null = null;
  showProfileDropdown: boolean = false;

  // Dashboard metrics
  waterRequestsCount: number = 0;
  waterRequestsPending: number = 0;
  reportsCount: number = 0;
  reportsActive: number = 0;
  residentsCount: number = 0;
  sensorsActive: number = 0;
  lastSensorUpdate: string = 'Live';

  private apiUrl = 'http://localhost:3000/api';

  options = [
    { path: '/requests', name: 'Solicitud de Agua Potable' },
    { path: '/login', name: 'Iniciar Sesión' },
    { path: '/signup', name: 'Registrarse' },
    { path: '/report', name: 'Lista de Reportes' },
    { path: '/providers', name: 'Lista de proveedores' },
    { path: '/provider', name: 'Detalles del proveedor' },
  ];

  constructor(
    private sensordataApiService: SensordataApiService,
    private residentService: ResidentService,
    private http: HttpClient ) {
  }

  ngOnInit(): void {
    this.loadUsername();
    this.loadDashboardData();
  }

  private loadUsername(): void {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.username = user?.username || null;
        this.userRole = user?.role || 'Provider';
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        this.username = null;
        this.userRole = 'Provider';
      }
    }
  }

  // Profile dropdown methods
  toggleProfileDropdown(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  getUserInitials(): string {
    if (!this.username) return 'U';
    return this.username
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  logout(): void {
    // Limpiar localStorage
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');

    // Cerrar dropdown
    this.showProfileDropdown = false;

    // Redirigir al login
    window.location.href = '/';
  }

  private loadDashboardData(): void {
    // Cargar datos de solicitudes de agua
    this.loadWaterRequests();

    // Cargar datos de reportes
    this.loadReports();

    // Cargar datos de residentes
    this.loadResidents();

    // Cargar datos de sensores
    this.loadSensors();
  }

  private loadWaterRequests(): void {

    this.sensordataApiService.getAllRequests().subscribe({
      next: (requests) => {
        this.waterRequestsCount = requests.length;
        this.waterRequestsPending = requests.filter(req => req.status === 'ESPERA').length;
      },
      error: (error) => {
        console.error('Error loading water requests:', error);
        this.waterRequestsCount = 12;
        this.waterRequestsPending = 8;
      }
    });
  }

  private loadReports(): void {
    this.http.get<any[]>(`${this.apiUrl}/reports`).subscribe({
      next: (reports) => {
        this.reportsCount = reports.length;
        this.reportsActive = reports.filter(report => report.status === 'active' || report.status === 'open').length;
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        // Datos de ejemplo en caso de error
        this.reportsCount = 25;
        this.reportsActive = 7;
      }
    });
  }

  private loadResidents(): void {
    this.residentService.getResidents().subscribe({
      next: (residents) => {
        this.residentsCount = residents.length;
        console.log(residents);
        if(!residents.length){
          this.residentsCount = 0;
        }
      },
      error: (error) => {
        console.error('Error loading residents:', error);
        // Datos de ejemplo en caso de error
        this.residentsCount = 156;
      }
    });
  }

  private loadSensors(): void {
    // Ejemplo de llamada a API para obtener datos de sensores
    this.http.get<any[]>(`${this.apiUrl}/sensors`).subscribe({
      next: (sensors) => {
        this.sensorsActive = sensors.filter(sensor => sensor.status === 'active').length;
        // Obtener la última actualización
        const lastUpdate = sensors.reduce((latest, sensor) => {
          const sensorDate = new Date(sensor.last_update || sensor.updated_at);
          return sensorDate > latest ? sensorDate : latest;
        }, new Date(0));

        this.lastSensorUpdate = this.formatRelativeTime(lastUpdate);
      },
      error: (error) => {
        console.error('Error loading sensors:', error);
        // Datos de ejemplo en caso de error
        this.sensorsActive = 8;
        this.lastSensorUpdate = '2min ago';
      }
    });
  }

  private formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Live';
    if (diffInMinutes < 60) return `${diffInMinutes}min ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }

  // Método para refrescar datos manualmente
  refreshDashboard(): void {
    this.loadDashboardData();
  }
}
