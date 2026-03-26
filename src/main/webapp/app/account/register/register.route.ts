import { Route } from '@angular/router';

import Register from './register';

/** Route definition for the self-service registration page. */
const registerRoute: Route = {
  path: 'register',
  component: Register,
  title: 'register.title',
};

export default registerRoute;
