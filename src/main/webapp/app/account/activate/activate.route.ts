import { Route } from '@angular/router';

import Activate from './activate';

/** Route definition for the account activation page. */
const activateRoute: Route = {
  path: 'activate',
  component: Activate,
  title: 'activate.title',
};

export default activateRoute;
