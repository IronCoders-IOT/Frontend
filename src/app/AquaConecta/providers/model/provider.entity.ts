export class Provider {
  id: number;
  tax_name: string;
  profile_id: number;
  user_id: number;
  ruc: string;
  phone: number;
  sensors_number: number;
  start_date: string;
  end_date: string;
  status: string;


  constructor() {
    this.id = 0;
    this.tax_name = "";
    this.ruc = "";
    this.profile_id = 0;
    this.user_id = 0;
    this.phone = 0;
    this.sensors_number = 0;
    this.start_date = "";
    this.end_date = "";
    this.status = "";
  }
}
