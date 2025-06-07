import {ResidentEntity} from './resident.entity';

export class WaterRequestEntity {
  id: number;
  residentId: number;
  providerId: number;
  requestedLiters: string;
  status: string;
  delivered_at: Date | null;
  resident: ResidentEntity | null; // CAMBIO: De array a objeto individual

  constructor() {
    this.id = 0;
    this.residentId = 0;
    this.providerId = 0;
    this.requestedLiters = "";
    this.status = "";
    this.delivered_at = null;
    this.resident = null; // CAMBIO: null en lugar de array vacío
  }
}
