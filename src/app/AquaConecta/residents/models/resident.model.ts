export class Resident {
  id?: number;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  direction: string;        // ← Campo requerido por el endpoint
  phone: string;

  // Campos que devuelve el endpoint pero no se envían
  providerId?: number;      // ← Se genera automáticamente
  userId?: number;          // ← Se genera automáticamente
  username?: string;        // ← Se genera automáticamente
  password?: string;        // ← Se genera automáticamente

  constructor(data: any = {}) {
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.documentType = data.documentType || '';
    this.documentNumber = data.documentNumber || '';
    this.email = data.email || '';
    this.direction = data.direction || '';
    this.phone = data.phone || '';

    // Campos opcionales que pueden venir del servidor
    this.id = data.id;
    this.providerId = data.providerId;
    this.userId = data.userId;
    this.username = data.username;
    this.password = data.password;
  }

  // Método para obtener solo los datos que se envían al crear
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
