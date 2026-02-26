import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IAmortizationEntry, ILoanAccount, NewLoanAccount } from '../loan-account.model';

export type PartialUpdateLoanAccount = Partial<ILoanAccount> & Pick<ILoanAccount, 'id'>;

export type EntityResponseType = HttpResponse<ILoanAccount>;
export type EntityArrayResponseType = HttpResponse<ILoanAccount[]>;

@Injectable({ providedIn: 'root' })
export class LoanAccountService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/loan-accounts');

  create(loanAccount: NewLoanAccount): Observable<EntityResponseType> {
    return this.http.post<ILoanAccount>(this.resourceUrl, loanAccount, { observe: 'response' });
  }

  update(loanAccount: ILoanAccount): Observable<EntityResponseType> {
    return this.http.put<ILoanAccount>(
      `${this.resourceUrl}/${encodeURIComponent(this.getLoanAccountIdentifier(loanAccount))}`,
      loanAccount,
      { observe: 'response' },
    );
  }

  partialUpdate(loanAccount: PartialUpdateLoanAccount): Observable<EntityResponseType> {
    return this.http.patch<ILoanAccount>(
      `${this.resourceUrl}/${encodeURIComponent(this.getLoanAccountIdentifier(loanAccount))}`,
      loanAccount,
      { observe: 'response' },
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ILoanAccount>(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ILoanAccount[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' });
  }

  getAmortizationSchedule(id: number): Observable<IAmortizationEntry[]> {
    return this.http.get<IAmortizationEntry[]>(`${this.resourceUrl}/${encodeURIComponent(id)}/amortization`);
  }

  getLoanAccountIdentifier(loanAccount: Pick<ILoanAccount, 'id'>): number {
    return loanAccount.id;
  }

  compareLoanAccount(o1: Pick<ILoanAccount, 'id'> | null, o2: Pick<ILoanAccount, 'id'> | null): boolean {
    return o1 && o2 ? this.getLoanAccountIdentifier(o1) === this.getLoanAccountIdentifier(o2) : o1 === o2;
  }

  addLoanAccountToCollectionIfMissing<Type extends Pick<ILoanAccount, 'id'>>(
    loanAccountCollection: Type[],
    ...loanAccountsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const loanAccounts: Type[] = loanAccountsToCheck.filter(isPresent);
    if (loanAccounts.length > 0) {
      const loanAccountCollectionIdentifiers = loanAccountCollection.map(loanAccountItem => this.getLoanAccountIdentifier(loanAccountItem));
      const loanAccountsToAdd = loanAccounts.filter(loanAccountItem => {
        const loanAccountIdentifier = this.getLoanAccountIdentifier(loanAccountItem);
        if (loanAccountCollectionIdentifiers.includes(loanAccountIdentifier)) {
          return false;
        }
        loanAccountCollectionIdentifiers.push(loanAccountIdentifier);
        return true;
      });
      return [...loanAccountsToAdd, ...loanAccountCollection];
    }
    return loanAccountCollection;
  }
}
