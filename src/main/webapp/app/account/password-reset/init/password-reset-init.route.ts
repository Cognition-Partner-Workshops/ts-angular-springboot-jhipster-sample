import { Route } from '@angular/router';

import PasswordResetInit from './password-reset-init';

/** Route definition for the password reset request page. */
const passwordResetInitRoute: Route = {
  path: 'reset/request',
  component: PasswordResetInit,
  title: 'global.menu.account.password',
};

export default passwordResetInitRoute;
