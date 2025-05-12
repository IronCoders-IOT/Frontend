export class AuthCredentials {
    email: string;
    password: string;

    constructor(email: string, password: string) {
        this.email = email;
        this.password = password;
    }

    isValid(): boolean {
        return this.email?.length > 0 && this.password?.length > 0;
    }
}