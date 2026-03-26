import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
/**
 * Provides the base URL prefix for all API calls and tracks whether
 * the app is running as a microfrontend.
 *
 * In development the prefix is typically empty (proxied by webpack-dev-server).
 * In production or gateway mode, it is set to the server's base path.
 */
export class ApplicationConfigService {
  /** URL prefix prepended to all API endpoint paths. */
  private endpointPrefix = '';
  /** True when running inside a JHipster gateway as a microfrontend module. */
  private microfrontend = false;

  /** Configures the API base URL prefix (called once during app bootstrap). */
  setEndpointPrefix(endpointPrefix: string): void {
    this.endpointPrefix = endpointPrefix;
  }

  /** Marks this app as a microfrontend module within a gateway. */
  setMicrofrontend(microfrontend = true): void {
    this.microfrontend = microfrontend;
  }

  /** Returns true if running as a microfrontend. */
  isMicrofrontend(): boolean {
    return this.microfrontend;
  }

  /**
   * Builds the full endpoint URL for an API path.
   * For microservice calls, inserts `services/{microservice}/` before the path.
   */
  getEndpointFor(api: string, microservice?: string): string {
    if (microservice) {
      return `${this.endpointPrefix}services/${microservice}/${api}`;
    }
    return `${this.endpointPrefix}${api}`;
  }
}
