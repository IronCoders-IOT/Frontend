import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportdataApiService } from '../../../services/reportdata-api.service';
import { ReportRequestEntity } from '../../../model/report-request.entity';
import { HeaderContentComponent } from "../../../../../public/components/header-content/header-content.component";

@Component({
  selector: 'app-report-detail',
  templateUrl: './report-detail.component.html',
  styleUrl: './report-detail.component.css',
  standalone: true,
  imports: [HeaderContentComponent],
})
export class ReportDetailComponent implements OnInit {
  report!: ReportRequestEntity;

  constructor(
    private route: ActivatedRoute,
    private reportService: ReportdataApiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.reportService.getReportById(id).subscribe((data) => {
        this.report = data;
      });
    }
  }
}