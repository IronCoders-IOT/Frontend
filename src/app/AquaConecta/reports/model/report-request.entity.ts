export class ReportRequestEntity {
  id: number;
  resident_name: string;
  emission_date: string;
  title: string;
  status: string;

  constructor() {
    this.id = 0;
    this.resident_name = "";
    this.emission_date = "";
    this.title = "";
    this.status = "";
  }
}