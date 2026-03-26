import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

/** Service that completes a password reset by submitting the reset key and new password. */
@Injectable({ providedIn: 'root' })
export class PasswordResetFinishService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  /** Posts the reset key and new password to POST /api/account/reset-password/finish. */
  save(key: string, newPassword: string): Observable<{}> {
    return this.http.post(this.applicationConfigService.getEndpointFor('api/account/reset-password/finish'), { key, newPassword });
  }
}
