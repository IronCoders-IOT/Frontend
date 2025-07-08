import {ResidentModel} from './resident.model';

export class WaterRequestModel {
  id: number;
  residentId: number;
  providerId: number;
  requestedLiters: string;
  status: string;
  delivered_at: Date | null;
  resident: ResidentModel | null; // CAMBIO: De array a objeto individual
  emissionDate: string | undefined;

  constructor() {
    this.id = 0;
    this.residentId = 0;
    this.providerId = 0;
    this.requestedLiters = "";
    this.status = "";
    this.delivered_at = null;
    this.resident = null; // CAMBIO: null en lugar de array vacío
    this.emissionDate = undefined; // CAMBIO: Inicializado como undefined
  }
}
