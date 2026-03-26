import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IBankAccount, NewBankAccount } from '../bank-account.model';

/** Partial update payload that always includes the entity id. */
export type PartialUpdateBankAccount = Partial<IBankAccount> & Pick<IBankAccount, 'id'>;

export type EntityResponseType = HttpResponse<IBankAccount>;
export type EntityArrayResponseType = HttpResponse<IBankAccount[]>;

/**
 * HTTP service for BankAccount CRUD operations against the Spring Boot REST API.
 * Provides standard create/read/update/delete methods plus collection utilities.
 */
@Injectable({ providedIn: 'root' })
export class BankAccountService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/bank-accounts');

  /** Creates a new bank account via POST. */
  create(bankAccount: NewBankAccount): Observable<EntityResponseType> {
    return this.http.post<IBankAccount>(this.resourceUrl, bankAccount, { observe: 'response' });
  }

  /** Fully updates an existing bank account via PUT. */
  update(bankAccount: IBankAccount): Observable<EntityResponseType> {
    return this.http.put<IBankAccount>(
      `${this.resourceUrl}/${encodeURIComponent(this.getBankAccountIdentifier(bankAccount))}`,
      bankAccount,
      { observe: 'response' },
    );
  }

  /** Partially updates a bank account via PATCH (only changed fields). */
  partialUpdate(bankAccount: PartialUpdateBankAccount): Observable<EntityResponseType> {
    return this.http.patch<IBankAccount>(
      `${this.resourceUrl}/${encodeURIComponent(this.getBankAccountIdentifier(bankAccount))}`,
      bankAccount,
      { observe: 'response' },
    );
  }

  /** Fetches a single bank account by id. */
  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IBankAccount>(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' });
  }

  /** Lists bank accounts with optional pagination/sort parameters. */
  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IBankAccount[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  /** Deletes a bank account by id. */
  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' });
  }

  /** Extracts the numeric identifier from a bank account entity. */
  getBankAccountIdentifier(bankAccount: Pick<IBankAccount, 'id'>): number {
    return bankAccount.id;
  }

  /** Compares two bank accounts by id for use in select dropdowns. */
  compareBankAccount(o1: Pick<IBankAccount, 'id'> | null, o2: Pick<IBankAccount, 'id'> | null): boolean {
    return o1 && o2 ? this.getBankAccountIdentifier(o1) === this.getBankAccountIdentifier(o2) : o1 === o2;
  }

  /** Adds bank accounts to a collection only if they are not already present (by id). */
  addBankAccountToCollectionIfMissing<Type extends Pick<IBankAccount, 'id'>>(
    bankAccountCollection: Type[],
    ...bankAccountsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const bankAccounts: Type[] = bankAccountsToCheck.filter(isPresent);
    if (bankAccounts.length > 0) {
      const bankAccountCollectionIdentifiers = bankAccountCollection.map(bankAccountItem => this.getBankAccountIdentifier(bankAccountItem));
      const bankAccountsToAdd = bankAccounts.filter(bankAccountItem => {
        const bankAccountIdentifier = this.getBankAccountIdentifier(bankAccountItem);
        if (bankAccountCollectionIdentifiers.includes(bankAccountIdentifier)) {
          return false;
        }
        bankAccountCollectionIdentifiers.push(bankAccountIdentifier);
        return true;
      });
      return [...bankAccountsToAdd, ...bankAccountCollection];
    }
    return bankAccountCollection;
  }
}
