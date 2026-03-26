import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

/** Service that sends the activation key to the server to confirm a new account's email. */
@Injectable({ providedIn: 'root' })
export class ActivateService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  /** Activates the account associated with the given activation key. */
  get(key: string): Observable<{}> {
    return this.http.get(this.applicationConfigService.getEndpointFor('api/activate'), {
      params: new HttpParams().set('key', key),
    });
  }
}
