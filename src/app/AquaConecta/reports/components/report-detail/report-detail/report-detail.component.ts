// report-detail.component.ts - FIXED VERSION
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReportdataApiService } from '../../../services/reportdata-api.service';
import { HeaderContentComponent } from "../../../../../public/components/header-content/header-content.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {ReportRequestEntity} from '../../../model/report-request.entity';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-report-detail',
  templateUrl: './report-detail.component.html',
  styleUrl: './report-detail.component.css',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    HeaderContentComponent,
    MatButtonModule,
    MatIconModule
  ],
})
export class ReportDetailComponent implements OnInit {
  report: ReportRequestEntity;

  constructor(
    private route: ActivatedRoute,
    private reportService: ReportdataApiService
  ) {
    this.report = new ReportRequestEntity(); // Initialize report to avoid undefined errors
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    console.log(id);

    if (id) {
      this.reportService.getReportById(id).pipe(
        switchMap((data) => {
          this.report = data;
          return this.reportService.getResidentById(data.residentId);
        })
      ).subscribe((residentData) => {
        this.report.firtsName = residentData[0].firstName;
        this.report.lastName = residentData[0].lastName;
        this.report.residentPhone = residentData[0].phone;
        this.report.residentAddress = residentData[0].address;

        console.log('Resident data loaded:', residentData);
        console.log('Report data loaded:', this.report);

      });
    }
  }
}
