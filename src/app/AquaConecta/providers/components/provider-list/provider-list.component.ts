import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {Provider} from '../../model/provider.entity';
import {ProviderApiServiceService} from '../../services/provider-api.service.service';

import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule, SortDirection} from '@angular/material/sort';
import {merge, Observable, of as observableOf} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CommonModule, DatePipe} from '@angular/common';

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import {HeaderContentComponent} from '../../../../public/components/header-content/header-content.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { LanguageToggleComponent } from '../../../../shared/components/language-toggle/language-toggle.component';

@Component({
  selector: 'app-provider-list',
  imports: [CommonModule,HeaderContentComponent, MatProgressSpinnerModule, MatTableModule, MatSortModule,
    MatPaginatorModule, MatFormFieldModule,MatInputModule, TranslatePipe, LanguageToggleComponent],
  templateUrl: './provider-list.component.html',
  standalone: true,
  styleUrl: './provider-list.component.css'
})
export class ProviderListComponent implements AfterViewInit {
  providers: MatTableDataSource<Provider> = new MatTableDataSource<Provider>();
  displayedColumns: string[] = ['id', 'tax_name', 'ruc', 'phone', 'sensors_number'];
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  constructor(private providerService: ProviderApiServiceService, private dialog: MatDialog, private router: Router)
  {
  }

  ngOnInit() {
    this.getAllProviders();
  }

  getAllProviders(): void {
    this.isLoadingResults = true;

    this.providerService.getAllProviders().subscribe(
      (response: Provider[]) => {
        //this.requests = response;
        this.providers.data= response;

        this.isLoadingResults = false;
        this.resultsLength = this.providers.data.length;
        console.log(this.providers);
      }

    );
  }

  applyStatusFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.providers.filter = filterValue; // Aplica el filtro directamente
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.providerService.getAllProviders().pipe(catchError(() => observableOf(null)));
        }),
        map(data => {
          this.isLoadingResults = false;
          if (data === null) {
            return [];
          }
          this.resultsLength = data.length;
          return data;
        }),
      )
      .subscribe(data => (this.providers.data = data));
  }

  onRowClick(providerId: number): void {
    console.log('Provider ID:', providerId);
    this.router.navigate([`/provider/${providerId}`]);

  }
}
