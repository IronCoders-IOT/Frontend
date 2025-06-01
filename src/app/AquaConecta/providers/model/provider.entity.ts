export class Provider {

  direction: string;
  documentNumber?: number;
  documentType?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  id: number;
  phone?: number;

  ruc: string;
  taxName: string;

  user_id: number;


  sensors_number: number;

  //start_date: string;
  //end_date: string;
  //status: string;
  constructor() {
    this.id = 0;
    this.taxName = "";
    this.ruc = "";
    this.user_id = 0;
    this.phone = 0;
    this.sensors_number = 0;
    this.email = "";
    this.direction = "";
    this.documentNumber = undefined;
    this.documentType = undefined;
    this.firstName = "";
    this.lastName = "";
  }
}
