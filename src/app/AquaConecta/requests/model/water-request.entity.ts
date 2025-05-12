export class WaterRequestEntity {
  id: number;
  resident_id: number;
  provider_id: number;
  requested_liters: number;
  status: string;
  delivered_at: Date | null;

  constructor() {
    this.id = 0;
    this.resident_id = 0;
    this.provider_id = 0;
    this.requested_liters = 0;
    this.status = " ";
    this.delivered_at =null ;
  }
}
