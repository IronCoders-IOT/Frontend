export class Resident {
  id?: number;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  
  constructor(params: Partial<Resident> = {}) {
    this.id = params.id;
    this.firstName = params.firstName || '';
    this.lastName = params.lastName || '';
    this.documentType = params.documentType || '';
    this.documentNumber = params.documentNumber || '';
    this.email = params.email || '';
    this.password = params.password;
    this.phone = params.phone;
    this.address = params.address || '';
  }
  
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}