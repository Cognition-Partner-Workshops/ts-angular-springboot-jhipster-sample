import { Routes } from '@angular/router';

import activateRoute from './activate/activate.route';
import passwordRoute from './password/password.route';
import passwordResetFinishRoute from './password-reset/finish/password-reset-finish.route';
import passwordResetInitRoute from './password-reset/init/password-reset-init.route';
import registerRoute from './register/register.route';
import settingsRoute from './settings/settings.route';

/** Aggregated routes for all account management features (activation, password, registration, settings). */
const accountRoutes: Routes = [
  activateRoute,
  passwordRoute,
  passwordResetFinishRoute,
  passwordResetInitRoute,
  registerRoute,
  settingsRoute,
];

export default accountRoutes;
