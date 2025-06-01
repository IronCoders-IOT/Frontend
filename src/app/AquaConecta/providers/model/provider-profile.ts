export class ProviderProfile {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    direction?: string;
    documentNumber?: number;
    documentType?: string;
    phone?: number;
    userId?: number;

    constructor() {
        this.id = 0;
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.direction ='';
        this.documentNumber = 0;
        this.documentType = '';
        this.phone = 0;
        this.userId = 0;
    }
}
