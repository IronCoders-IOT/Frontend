export class Resident {
  id: number;

  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  direction: string;
  phone: string;

  providerId?: number;
  userId?: number;
  username?: string;
  password?: string;

  constructor(data: any = {}) {
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.documentType = data.documentType || '';
    this.documentNumber = data.documentNumber || '';
    this.email = data.email || '';
    this.direction = data.direction || '';
    this.phone = data.phone || '';

    this.id = data.id;
    this.providerId = data.providerId;
    this.userId = data.userId;
    this.username = data.username;
    this.password = data.password;
  }

  toCreateRequest(): any {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      direction: this.direction,
      documentNumber: this.documentNumber,
      documentType: this.documentType,
      phone: this.phone
    };
  }

}
