import { HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ILoanAccount } from '../loan-account.model';
import { LoanAccountService } from '../service/loan-account.service';

const loanAccountResolve = (route: ActivatedRouteSnapshot): Observable<null | ILoanAccount> => {
  const id = route.params.id;
  if (id) {
    return inject(LoanAccountService)
      .find(id)
      .pipe(
        mergeMap((loanAccount: HttpResponse<ILoanAccount>) => {
          if (loanAccount.body) {
            return of(loanAccount.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default loanAccountResolve;
