import {ResidentModel} from '../../requests/model/resident.model';

export class IssueReportModel {
  id: number;
  emissionDate: string;
  residentId : number;
  title: string;
  status: string;
  description: string;
  providerId: number;

  firtsName: string;
  lastName: string;

  residentAddress: string;
  residentPhone: number;
  resident: ResidentModel | null;

  constructor() {
    this.id = 0;
    this.emissionDate = "";
    this.residentId = 0; // CAMBIO: Agregado para relacionar con el residente
    this.title = "";
    this.status = "";
    this.resident = null; // CAMBIO: null en lugar de array vacío
    this.description = "";

    this.providerId = 0;
    this.firtsName = "";
    this.lastName = "";
    this.residentAddress = "";
    this.residentPhone = 0; // CAMBIO: Agregado para almacenar el teléfono del residente
  }
}
