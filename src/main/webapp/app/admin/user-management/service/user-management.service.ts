import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable, map } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { Pagination } from 'app/core/request/request.model';
import { IUser } from '../user-management.model';

/**
 * Admin HTTP service for user management CRUD operations.
 * Calls the `/api/admin/users` endpoint (requires ROLE_ADMIN).
 */
@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/admin/users');

  /** Creates a new user account. */
  create(user: IUser): Observable<IUser> {
    return this.http.post<IUser>(this.resourceUrl, user);
  }

  /** Updates an existing user account. */
  update(user: IUser): Observable<IUser> {
    return this.http.put<IUser>(this.resourceUrl, user);
  }

  /** Fetches a single user by login. */
  find(login: string): Observable<IUser> {
    return this.http.get<IUser>(`${this.resourceUrl}/${encodeURIComponent(login)}`);
  }

  /** Lists users with server-side pagination and sorting. */
  query(req?: Pagination): Observable<HttpResponse<IUser[]>> {
    const options = createRequestOption(req);
    return this.http.get<IUser[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  /** Deletes a user by login. */
  delete(login: string): Observable<{}> {
    return this.http.delete(`${this.resourceUrl}/${encodeURIComponent(login)}`);
  }

  /** Fetches available authority/role names for the authority dropdown. */
  authorities(): Observable<string[]> {
    return this.http
      .get<{ name: string }[]>(this.applicationConfigService.getEndpointFor('api/authorities'))
      .pipe(map(authorities => authorities.map(a => a.name)));
  }
}
