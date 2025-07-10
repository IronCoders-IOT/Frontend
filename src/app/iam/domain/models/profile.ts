export class Profile{

  name?: string;
  email?: string;
  direction?: string;
  documentNumber?: string;
  documentType?: string;
  phone?: string;
  userId?: string;

  constructor(params: Partial<Profile>) {
    this.name = params.name;
    this.email = params.email;
    this.direction = params.direction;
    this.documentNumber = params.documentNumber;
    this.documentType = params.documentType;
    this.phone = params.phone;
    this.userId = params.userId;

  }
}
