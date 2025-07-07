export class Subscription {

  id: number;
  start_date: Date;
  end_date: Date;
  status: string;
  sensor_id: number;
  resident_id: number;

  constructor(){
    this.id = 0;
    this.start_date = new Date();
    this.end_date = new Date();
    this.status = "";
    this.sensor_id = 0;
    this.resident_id = 0;

  }


}
