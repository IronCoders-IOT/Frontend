import {ResidentEntity} from '../../requests/model/resident.entity';

export class ReportRequestEntity {
  id: number;
  emission_date: string;
  residentId : number;
  title: string;
  status: string;

  resident: ResidentEntity | null;

  constructor() {
    this.id = 0;
    this.emission_date = "";
    this.residentId = 0; // CAMBIO: Agregado para relacionar con el residente
    this.title = "";
    this.status = "";
    this.resident = null; // CAMBIO: null en lugar de array vacío
  }
}
