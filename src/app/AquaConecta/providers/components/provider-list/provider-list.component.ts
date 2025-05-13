import { Component } from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {Provider} from '../../model/provider.entity';

@Component({
  selector: 'app-provider-list',
  imports: [],
  templateUrl: './provider-list.component.html',
  standalone: true,
  styleUrl: './provider-list.component.css'
})
export class ProviderListComponent {
  providers: MatTableDataSource<Provider> = new MatTableDataSource<Provider>();
  displayedColumns: string[] = ['id', 'tax_name', 'ruc', 'phone', 'sensors_number'];
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;



}
