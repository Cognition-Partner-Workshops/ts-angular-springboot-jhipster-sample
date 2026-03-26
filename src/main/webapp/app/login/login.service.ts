import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { Account } from 'app/core/auth/account.model';
import { AccountService } from 'app/core/auth/account.service';
import { AuthServerProvider } from 'app/core/auth/auth-jwt.service';

import { Login } from './login.model';

/**
 * Orchestrates the login/logout flow by coordinating {@link AuthServerProvider}
 * (JWT exchange) and {@link AccountService} (identity fetch/clear).
 */
@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly accountService = inject(AccountService);
  private readonly authServerProvider = inject(AuthServerProvider);

  /** Authenticates the user, then fetches and caches the account identity. */
  login(credentials: Login): Observable<Account | null> {
    return this.authServerProvider.login(credentials).pipe(mergeMap(() => this.accountService.identity(true)));
  }

  /** Clears the JWT and resets the account identity to null. */
  logout(): void {
    this.authServerProvider.logout().subscribe({ complete: () => this.accountService.authenticate(null) });
  }
}
