import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { User } from '../../domain/models/user.model';
import { AuthCredentials } from '../../domain/models/auth-credentials.model';
import { Router } from '@angular/router';
import {BaseService} from '../../../../shared/services/base.service';
import {catchError } from 'rxjs/operators';
import {environment} from '../../../../../environments/environment';
import { of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService extends BaseService<User> {

    private readonly TOKEN_KEY = 'auth_token';
    private readonly USER_KEY = 'auth_user';
    private currentUserSubject = new BehaviorSubject<User | null>(null);

    public currentUser$ = this.currentUserSubject.asObservable();
    public isLoggedIn$ = this.currentUser$.pipe(map(user => !!user));

    constructor(
        http: HttpClient,
        private router: Router
    ) {
      super(http);
      this.resourceEndpoint = 'authentication/sign-up';

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
    this.resourceEndpoint = 'authentication/sign-in';
    const payload = {
      username: credentials.email, // Mapear email al campo username
      password: credentials.password
    };

    return this.http.post<{ id: number; username: string; token: string }>(
      `${environment.serverBasePath}${this.resourceEndpoint}`,
      payload
    ).pipe(
      tap(response => {
        const user = new User({
          id: Number(response.id), // Convertir el valor a tipo number
          username: response.username,
          email: credentials.email
        });

        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);

      }),
      catchError((error: any) => {
        console.error('Error en el login:', error);
        return throwError(() => new Error('Error en el login'));
      })
    );



  }

  signup(username: string, password: string, roles: string[], profileData: any): Observable<void> {
    console.log('Iniciando proceso de signup para:', username);
    const payload = { username, password, roles };

    return this.http.post<{ id: number; username: string }>(
      `${environment.serverBasePath}${this.resourceEndpoint}`,
      payload
    ).pipe(
      tap(signupResponse => {
        console.log('Respuesta del signup:', signupResponse);
      }),
      switchMap(signupResponse => {
        console.log('Procediendo con login automático...');
        const loginPayload = { username, password };

        return this.http.post<{ token: string }>(
          `${environment.serverBasePath}authentication/sign-in`,
          loginPayload
        ).pipe(
          tap(loginResponse => {
            console.log('Respuesta del login:', loginResponse);

            // Verificar que el token existe
            if (!loginResponse.token) {
              throw new Error('El servidor no devolvió un token válido');
            }

            console.log('Token recibido:');
            localStorage.setItem('auth_token', loginResponse.token);
            console.log('Token guardado en localStorage');
          }),
          switchMap(loginResponse => {
            const token = loginResponse.token;
            console.log('Creando perfil de usuario...');

            // Primero crear el perfil de usuario
            const profilePayload = {
              firstName: profileData.firstName,
              lastName: profileData.lastName,
              email: profileData.email,
              direction: profileData.direction,
              documentNumber: profileData.documentNumber,
              documentType: profileData.documentType,
              phone: profileData.phone,
              userId: signupResponse.id
            };

            console.log('Payload del perfil:', profilePayload);
            console.log('URL del perfil:', `${environment.serverBasePath}profiles`);
            console.log('Headers que se enviarán:', {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            });

            return this.http.post<void>(
              `${environment.serverBasePath}profiles`,
              profilePayload,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            ).pipe(
              tap(() => {
                console.log('Perfil creado exitosamente');
              }),

              //creacion del perfil

                switchMap(() => {
                  // Después de crear el perfil, verificar si necesita crear provider
                  if (roles.includes('ROLE_PROVIDER')) {
                    console.log('Creando perfil de proveedor...');

                    const providerPayload = {
                      taxName: profileData.companyName,
                      ruc: profileData.ruc,
                      userId: signupResponse.id
                    };

                    console.log('Payload del proveedor:', providerPayload);

                    return this.http.post<void>(
                      `${environment.serverBasePath}providers`,
                      providerPayload,
                      {
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        }
                      }
                    ).pipe(
                      tap(() => {
                        console.log('Perfil de proveedor creado exitosamente');
                      }),
                      catchError((providerError: any) => {
                        console.error('Error detallado al crear proveedor:', providerError);
                        console.error('Status:', providerError.status);
                        console.error('Message:', providerError.message);
                        console.error('Token usado:', token);
                        return throwError(() => new Error(`Error al crear el perfil de proveedor: ${providerError.message || providerError.error?.message || 'Error desconocido'}`));
                      })
                    );
                  } else {
                    console.log('No es proveedor, saltando creación de provider');
                    // Si no es proveedor, retornar observable vacío
                    return of(void 0);
                  }
                }),


              catchError((profileError: any) => {
                console.error('Error detallado al crear perfil:', profileError);
                console.error('Status:', profileError.status);
                console.error('Message:', profileError.message);
                console.error('Error completo:', profileError);
                console.error('Token usado:', token);
                console.error('URL usada:', `${environment.serverBasePath}profiles`);

                // Verificar si el token está en localStorage
                const storedToken = localStorage.getItem('auth_token');
                console.error('Token en localStorage:', storedToken);

                return throwError(() => new Error(`Error al crear el perfil de usuario: ${profileError.message || profileError.error?.message || 'Error desconocido'}`));
              })
            );
          }),
          catchError((loginError: any) => {
            console.error('Error en el login automático:', loginError);
            console.error('Status:', loginError.status);
            console.error('Message:', loginError.message);
            return throwError(() => new Error(`Error en el login automático: ${loginError.message || loginError.error?.message || 'Error desconocido'}`));
          })
        );
      }),
      map(() => {
        console.log('Proceso de signup completado exitosamente');
        return void 0;
      }),
      catchError((error: any) => {
        console.error('Error general en el registro:', error);
        console.error('Stack trace:', error.stack);
        return throwError(() => new Error(`Error en el registro: ${error.message || 'Error desconocido'}`));
      })
    );
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
