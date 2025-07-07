export class ResidentModel {
  id: number;
  firstName: String;
  lastName: String;
  providerId: number;
  userId: number;
  username: String;

  constructor() {
    this.id = 0;
    this.firstName = "";
    this.lastName = "";
    this.providerId = 0;
    this.userId = 0;
    this.username = "";
  }
}
