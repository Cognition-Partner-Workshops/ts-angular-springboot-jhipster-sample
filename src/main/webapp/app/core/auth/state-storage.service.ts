import { Injectable } from '@angular/core';

/**
 * Manages browser storage for authentication tokens, locale preferences,
 * and the URL to redirect to after login.
 *
 * Uses sessionStorage by default, falling back to localStorage when the
 * "remember me" option is selected during login.
 */
@Injectable({ providedIn: 'root' })
export class StateStorageService {
  private readonly previousUrlKey = 'previousUrl';
  /** Key under which the JWT is stored in localStorage or sessionStorage. */
  private readonly authenticationKey = 'jhi-authenticationToken';
  private readonly localeKey = 'locale';

  /** Saves the current URL so the user can be redirected back after login. */
  storeUrl(url: string): void {
    sessionStorage.setItem(this.previousUrlKey, JSON.stringify(url));
  }

  /** Retrieves the previously stored redirect URL, or null if none exists. */
  getUrl(): string | null {
    const previousUrl = sessionStorage.getItem(this.previousUrlKey);
    return previousUrl ? (JSON.parse(previousUrl) as string | null) : previousUrl;
  }

  /** Removes the stored redirect URL after a successful redirect. */
  clearUrl(): void {
    sessionStorage.removeItem(this.previousUrlKey);
  }

  /**
   * Persists the JWT. Uses localStorage for remember-me (survives browser close)
   * or sessionStorage for session-only tokens.
   */
  storeAuthenticationToken(authenticationToken: string, rememberMe: boolean): void {
    authenticationToken = JSON.stringify(authenticationToken);
    this.clearAuthenticationToken();
    if (rememberMe) {
      localStorage.setItem(this.authenticationKey, authenticationToken);
    } else {
      sessionStorage.setItem(this.authenticationKey, authenticationToken);
    }
  }

  /** Retrieves the JWT from localStorage or sessionStorage (checks both). */
  getAuthenticationToken(): string | null {
    const authenticationToken = localStorage.getItem(this.authenticationKey) ?? sessionStorage.getItem(this.authenticationKey);
    return authenticationToken ? (JSON.parse(authenticationToken) as string | null) : authenticationToken;
  }

  /** Removes the JWT from both storage locations. */
  clearAuthenticationToken(): void {
    sessionStorage.removeItem(this.authenticationKey);
    localStorage.removeItem(this.authenticationKey);
  }

  /** Saves the user's language preference for the current session. */
  storeLocale(locale: string): void {
    sessionStorage.setItem(this.localeKey, locale);
  }

  /** Returns the stored locale override, or null if none was set this session. */
  getLocale(): string | null {
    return sessionStorage.getItem(this.localeKey);
  }

  /** Removes the session locale override. */
  clearLocale(): void {
    sessionStorage.removeItem(this.localeKey);
  }
}
