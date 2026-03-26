import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Login } from 'app/login/login.model';
import { ApplicationConfigService } from '../config/application-config.service';

import { StateStorageService } from './state-storage.service';

/** Shape of the JWT response from POST /api/authenticate. */
type JwtToken = {
  id_token: string;
};

/**
 * Handles JWT authentication against the Spring Boot backend.
 *
 * On login, posts credentials to /api/authenticate, receives a JWT,
 * and stores it via {@link StateStorageService}. The token is then
 * attached to subsequent requests by {@link authInterceptor}.
 */
@Injectable({ providedIn: 'root' })
export class AuthServerProvider {
  private readonly http = inject(HttpClient);
  private readonly stateStorageService = inject(StateStorageService);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  /** Returns the stored JWT, or an empty string if none exists. */
  getToken(): string {
    return this.stateStorageService.getAuthenticationToken() ?? '';
  }

  /** Authenticates against the backend and stores the returned JWT. */
  login(credentials: Login): Observable<void> {
    return this.http
      .post<JwtToken>(this.applicationConfigService.getEndpointFor('api/authenticate'), credentials)
      .pipe(map(response => this.authenticateSuccess(response, credentials.rememberMe)));
  }

  /** Clears the stored JWT, effectively ending the session. */
  logout(): Observable<void> {
    return new Observable(observer => {
      this.stateStorageService.clearAuthenticationToken();
      observer.complete();
    });
  }

  /** Stores the JWT using localStorage (remember-me) or sessionStorage. */
  private authenticateSuccess(response: JwtToken, rememberMe: boolean): void {
    this.stateStorageService.storeAuthenticationToken(response.id_token, rememberMe);
  }
}
