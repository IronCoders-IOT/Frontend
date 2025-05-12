import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from '../../domain/models/user.model';
import { AuthCredentials } from '../../domain/models/auth-credentials.model';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly TOKEN_KEY = 'auth_token';
    private readonly USER_KEY = 'auth_user';
    private currentUserSubject = new BehaviorSubject<User | null>(null);

    public currentUser$ = this.currentUserSubject.asObservable();
    public isLoggedIn$ = this.currentUser$.pipe(map(user => !!user));

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        this.loadStoredUser();
    }

    // Add the missing loadStoredUser method
    private loadStoredUser(): void {
        const storedUser = localStorage.getItem(this.USER_KEY);
        if (storedUser) {
            this.currentUserSubject.next(JSON.parse(storedUser));
        }
    }

    // Add the missing login method
    login(credentials: AuthCredentials): Observable<User> {
        // In a real scenario, this would connect to a backend
        // For now, simulate a successful response if the email has a valid format
        if (this.isValidEmail(credentials.email) && credentials.password.length >= 6) {
            const mockUser = new User({
                id: '1',
                email: credentials.email,
                name: 'Usuario de AquaConecta'
            });

            // Simulate a JWT token
            const mockToken = btoa(JSON.stringify({ sub: mockUser.id, email: mockUser.email }));

            localStorage.setItem(this.TOKEN_KEY, mockToken);
            localStorage.setItem(this.USER_KEY, JSON.stringify(mockUser));

            this.currentUserSubject.next(mockUser);
            return new Observable<User>(observer => {
                observer.next(mockUser);
                observer.complete();
            });
        } else {
            return throwError(() => new Error('Invalid credentials'));
        }
    }

    signup(email: string, password: string, name: string): Observable<User> {
        // Simulate registration
        if (this.isValidEmail(email) && password.length >= 6) {
            const mockUser = new User({
                id: '1',
                email: email,
                name: name
            });

            const mockToken = btoa(JSON.stringify({ sub: mockUser.id, email: mockUser.email }));

            localStorage.setItem(this.TOKEN_KEY, mockToken);
            localStorage.setItem(this.USER_KEY, JSON.stringify(mockUser));

            this.currentUserSubject.next(mockUser);
            return new Observable<User>(observer => {
                observer.next(mockUser);
                observer.complete();
            });
        } else {
            return throwError(() => new Error('Invalid registration data'));
        }
    }

    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }
}