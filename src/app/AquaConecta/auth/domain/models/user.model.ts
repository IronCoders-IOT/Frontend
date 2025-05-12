export class User {
    id?: string;
    email: string;
    name?: string;

    constructor(params: Partial<User>) {
        this.id = params.id;
        this.email = params.email || '';
        this.name = params.name;
    }
}