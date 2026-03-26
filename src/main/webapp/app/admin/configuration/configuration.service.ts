import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

import { Bean, Beans, ConfigProps, Env, PropertySource } from './configuration.model';

/** Service for fetching Spring Boot configuration properties and environment details. */
@Injectable({ providedIn: 'root' })
export class ConfigurationService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  /** Fetches all `@ConfigurationProperties` beans, flattened across contexts. */
  getBeans(): Observable<Bean[]> {
    return this.http.get<ConfigProps>(this.applicationConfigService.getEndpointFor('management/configprops')).pipe(
      map(configProps =>
        Object.values(
          Object.values(configProps.contexts)
            .map(context => context.beans)
            .reduce((allBeans: Beans, contextBeans: Beans) => ({ ...allBeans, ...contextBeans }), {}),
        ),
      ),
    );
  }

  /** Fetches property sources from the Spring Environment. */
  getPropertySources(): Observable<PropertySource[]> {
    return this.http.get<Env>(this.applicationConfigService.getEndpointFor('management/env')).pipe(map(env => env.propertySources));
  }
}
