import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

/** Service that initiates a password reset by sending the user's email to the server. */
@Injectable({ providedIn: 'root' })
export class PasswordResetInitService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  /** Posts the email to POST /api/account/reset-password/init. */
  save(mail: string): Observable<{}> {
    return this.http.post(this.applicationConfigService.getEndpointFor('api/account/reset-password/init'), mail);
  }
}
