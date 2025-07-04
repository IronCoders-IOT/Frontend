export interface ResidentData {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  documentNumber: string;
  providerId: number;
  userId: number;
  username: string;
  password: string;
}

export interface SubscriptionData {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  sensorId: number;
  residentId: number;
}

export interface SensorEvent {
  id: number;
  eventType: string;
  qualityValue: string;
  levelValue: string;
  sensorId: number;
}

export interface ResidentSensorData {
  resident: ResidentData;
  subscription: SubscriptionData | null;
  sensorEvents: SensorEvent[];
}
