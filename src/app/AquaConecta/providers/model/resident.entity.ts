export class Resident {

  id:number;
  first_name:string;
  last_name:string;
  user_id:number;
  providerId:number;
  status:string;

  constructor() {
    this.id = 0;
    this.first_name = "";
    this.last_name = "";
    this.user_id = 0;
    this.providerId = 0;
    this.status = "";
  }
}
