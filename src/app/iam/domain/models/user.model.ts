export class User {
    id?: number;
    email?: string;
    username?: string;
    password?: string;
    roles?: string; // Assuming 'roll' is a typo and should be 'role'

    constructor(params: Partial<User>) {
        this.id = params.id;
        this.email = params.email;
        this.username = params.username;
        this.password = params.password;
        this.roles = params.roles; // Assuming 'roll' is a typo and should be 'role'

    }
}
