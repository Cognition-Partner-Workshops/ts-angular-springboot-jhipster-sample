import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

const transferRoute: Routes = [
  {
    path: 'new',
    loadComponent: () => import('./update/transfer-update').then(m => m.TransferUpdate),
    canActivate: [UserRouteAccessService],
  },
];

export default transferRoute;
