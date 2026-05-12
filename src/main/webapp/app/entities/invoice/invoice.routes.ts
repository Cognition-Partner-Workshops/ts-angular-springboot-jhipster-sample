import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import InvoiceResolve from './route/invoice-routing-resolve.service';

const invoiceRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/invoice').then(m => m.Invoice),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/invoice-detail').then(m => m.InvoiceDetail),
    resolve: {
      invoice: InvoiceResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/invoice-update').then(m => m.InvoiceUpdate),
    resolve: {
      invoice: InvoiceResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/invoice-update').then(m => m.InvoiceUpdate),
    resolve: {
      invoice: InvoiceResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default invoiceRoute;
