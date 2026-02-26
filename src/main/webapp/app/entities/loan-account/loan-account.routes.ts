import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import LoanAccountResolve from './route/loan-account-routing-resolve.service';

const loanAccountRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/loan-account').then(m => m.LoanAccountListComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/loan-account-detail').then(m => m.LoanAccountDetail),
    resolve: {
      loanAccount: LoanAccountResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/loan-account-update').then(m => m.LoanAccountUpdate),
    resolve: {
      loanAccount: LoanAccountResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/loan-account-update').then(m => m.LoanAccountUpdate),
    resolve: {
      loanAccount: LoanAccountResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default loanAccountRoute;
