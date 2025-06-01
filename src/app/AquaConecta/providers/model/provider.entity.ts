export class Provider {
  id: number;
  company_name: string;
  email: string;
  direction: string;
  phone: number;
  user_id: number;
  profile_id: number;

  tax_name: string;
  ruc: string;
  sensors_number: number;

  //start_date: string;
  //end_date: string;
  //status: string;


  constructor() {
    this.id = 0;
    this.tax_name = "";
    this.ruc = "";
    this.profile_id = 0;
    this.user_id = 0;
    this.phone = 0;
    this.sensors_number = 0;
    this.company_name = "";
    this.email = "";
    this.direction = "";
    //this.start_date = "";
    //this.end_date = "";
    //this.status = "";
  }
}
