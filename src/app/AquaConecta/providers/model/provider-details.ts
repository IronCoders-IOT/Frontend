export class ProviderDetails {
  id?: number;
  taxName: string;
  ruc: string;
  userId?: number;

  constructor() {
    this.id = 0;
    this.taxName = '';
    this.ruc = '';
    this.userId = 0;
  }
}

