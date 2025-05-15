// report-detail.component.ts - FIXED VERSION
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReportdataApiService } from '../../../services/reportdata-api.service';
import { ReportRequestEntity } from '../../../model/report-request.entity';
import { HeaderContentComponent } from "../../../../../public/components/header-content/header-content.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
  report: any = {}; // Changed to any with empty object to avoid undefined errors

  constructor(
    private route: ActivatedRoute,
    private reportService: ReportdataApiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.reportService.getReportById(id).subscribe((data) => {
        this.report = data;
        console.log('Report data loaded:', this.report); // Debug to see what's coming back
      });
    }
  }
}