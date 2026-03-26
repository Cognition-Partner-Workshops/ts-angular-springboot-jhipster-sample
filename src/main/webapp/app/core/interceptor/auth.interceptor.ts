import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { StateStorageService } from 'app/core/auth/state-storage.service';
import { ApplicationConfigService } from '../config/application-config.service';

/**
 * Attaches the JWT Bearer token to outgoing HTTP requests targeting the application server.
 *
 * Skips requests to external URLs (those starting with 'http' that don't match the server API prefix).
 * Uses the standard `Authorization: Bearer <token>` scheme expected by Spring Security.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const stateStorageService = inject(StateStorageService);
  const applicationConfigService = inject(ApplicationConfigService);

  const serverApiUrl = applicationConfigService.getEndpointFor('');
  if (!req.url || (req.url.startsWith('http') && !(serverApiUrl && req.url.startsWith(serverApiUrl)))) {
    return next(req);
  }

  const token = stateStorageService.getAuthenticationToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  return next(req);
};
