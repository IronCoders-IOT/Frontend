export class Resident {

  id:number;
  first_name:string;
  last_name:string;
  user_id:number;
  provider_id:number;

  constructor() {
    this.id = 0;
    this.first_name = "";
    this.last_name = "";
    this.user_id = 0;
    this.provider_id = 0;
  }
}
