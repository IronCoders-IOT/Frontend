export class Event {
  id?: number;
  event_type: string;
  quality_value: string;
  level_value: string;
  sensor_id?: number;

  
  constructor(params: Partial<Event> = {}) {
    this.id = params.id;
    this.event_type = params.event_type || '';
    this.quality_value = params.quality_value || '';
    this.level_value = params.level_value || '';
    this.sensor_id = params.sensor_id || 0;
  }

}
