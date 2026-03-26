import { HttpClient } from '@angular/common/http';
import { Injectable, Signal, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { Observable, ReplaySubject, of } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';

import { Account } from 'app/core/auth/account.model';
import { StateStorageService } from 'app/core/auth/state-storage.service';
import { ApplicationConfigService } from '../config/application-config.service';

/**
 * Central service for managing the authenticated user's identity and authorization state.
 *
 * On login, {@link identity} fetches the account from the server, caches it, and
 * broadcasts changes via a {@link ReplaySubject}. Components and guards use
 * {@link trackCurrentAccount}, {@link isAuthenticated}, and {@link hasAnyAuthority}
 * to drive UI visibility and route protection.
 */
@Injectable({ providedIn: 'root' })
export class AccountService {
  /** Reactive signal holding the current user identity, or null when unauthenticated. */
  private readonly userIdentity = signal<Account | null>(null);
  /** Replays the latest identity to late subscribers (e.g. route guards). */
  private readonly authenticationState = new ReplaySubject<Account | null>(1);
  /** Cached account observable; invalidated on logout or forced re-fetch. */
  private accountCache$?: Observable<Account> | null;

  private readonly translateService = inject(TranslateService);
  private readonly http = inject(HttpClient);
  private readonly stateStorageService = inject(StateStorageService);
  private readonly router = inject(Router);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  /** Persists account profile changes (settings page) via POST /api/account. */
  save(account: Account): Observable<{}> {
    return this.http.post(this.applicationConfigService.getEndpointFor('api/account'), account);
  }

  /** Sets or clears the authenticated identity and notifies all subscribers. */
  authenticate(identity: Account | null): void {
    this.userIdentity.set(identity);
    this.authenticationState.next(this.userIdentity());
    if (!identity) {
      this.accountCache$ = null;
    }
  }

  /** Returns a read-only signal of the current account for template bindings. */
  trackCurrentAccount(): Signal<Account | null> {
    return this.userIdentity.asReadonly();
  }

  /** Checks whether the current user holds at least one of the given authority roles. */
  hasAnyAuthority(authorities: string[] | string): boolean {
    const userIdentity = this.userIdentity();
    if (!userIdentity) {
      return false;
    }
    if (!Array.isArray(authorities)) {
      authorities = [authorities];
    }
    return userIdentity.authorities.some((authority: string) => authorities.includes(authority));
  }

  /**
   * Fetches and caches the current account from the server.
   * Returns the cached value unless {@link force} is true (e.g. after login).
   * Also applies the user's preferred language if no locale override exists.
   */
  identity(force?: boolean): Observable<Account | null> {
    if (!this.accountCache$ || force) {
      this.accountCache$ = this.fetch().pipe(
        tap((account: Account) => {
          this.authenticate(account);

          // After retrieve the account info, the language will be changed to
          // the user's preferred language configured in the account setting
          // unless user have chosen another language in the current session
          if (account.langKey && !this.stateStorageService.getLocale()) {
            this.translateService.use(account.langKey);
          }

          this.navigateToStoredUrl();
        }),
        shareReplay(),
      );
    }
    return this.accountCache$.pipe(catchError(() => of(null)));
  }

  /** Returns true if a user identity is currently loaded (synchronous check). */
  isAuthenticated(): boolean {
    return this.userIdentity() !== null;
  }

  /** Returns an observable that emits whenever the authentication state changes. */
  getAuthenticationState(): Observable<Account | null> {
    return this.authenticationState.asObservable();
  }

  /** Fetches the account from GET /api/account. */
  private fetch(): Observable<Account> {
    return this.http.get<Account>(this.applicationConfigService.getEndpointFor('api/account'));
  }

  /** Redirects to a previously stored URL after successful login, then clears it. */
  private navigateToStoredUrl(): void {
    // previousState can be set in the authExpiredInterceptor and in the userRouteAccessService
    // if login is successful, go to stored previousState and clear previousState
    const previousUrl = this.stateStorageService.getUrl();
    if (previousUrl) {
      this.stateStorageService.clearUrl();
      this.router.navigateByUrl(previousUrl);
    }
  }
}
