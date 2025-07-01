export class Event {
  id?: number;
  event_type: string;
  quality_value: string;
  status: string;
  level_value: string;


  constructor(params: Partial<Event> = {}) {
    this.id = params.id;
    this.event_type = params.event_type || '';
    this.quality_value = params.quality_value || '';
    this.status = params.status || '';
    this.level_value = params.level_value || '';
  }

}
