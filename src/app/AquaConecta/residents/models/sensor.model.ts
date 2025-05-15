export class Sensor {
  id?: number;
  type: string;
  status: string;
  description: string;
  resident_id?: number;

  constructor(params: Partial<Sensor> = {}) {
    this.id = params.id;
    this.type = params.type || '';
    this.status = params.status || '';
    this.description = params.description || '';
    this.resident_id = params.resident_id || 0;
  }
}