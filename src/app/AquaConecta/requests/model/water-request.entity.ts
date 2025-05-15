export class WaterRequestEntity {
  id: number;
  resident_name: string;
  emission_date: string;
  requested_liters: number;
  status: string;
  delivered_at: Date | null;

  constructor() {
    this.id = 0;
    this.resident_name = "";
    this.emission_date = "";
    this.requested_liters = 0;
    this.status = "";
    this.delivered_at = null;
  }
}
