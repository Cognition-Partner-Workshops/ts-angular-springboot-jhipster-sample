import {
  adminMenuSelector,
  entityItemSelector,
  navbarSelector,
  usernameLoginSelector,
  passwordLoginSelector,
  submitLoginSelector,
  errorLoginSelector,
} from '../../support/commands';

describe('Authentication Flows e2e test', () => {
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const adminUsername = Cypress.env('E2E_ADMIN_USERNAME') ?? 'admin';
  const adminPassword = Cypress.env('E2E_ADMIN_PASSWORD') ?? 'admin';

  beforeEach(() => {
    cy.intercept('POST', '/api/authenticate').as('authenticate');
    cy.intercept('GET', '/api/account').as('account');
  });

  describe('JWT token management', () => {
    it('should store JWT token in session storage after login', () => {
      cy.login(username, password);
      cy.visit('/');
      cy.window().then(win => {
        const token = win.sessionStorage.getItem(Cypress.env('jwtStorageName'));
        expect(token).to.not.equal(null);
      });
    });

    it('should clear session on logout', () => {
      cy.login(username, password);
      cy.visit('/');
      cy.clickOnLogoutItem();
      cy.window().then(win => {
        const token = win.sessionStorage.getItem(Cypress.env('jwtStorageName'));
        expect(token).to.equal(null);
      });
    });

    it('should use JWT for authenticated API requests', () => {
      cy.login(username, password);
      cy.authenticatedRequest({
        method: 'GET',
        url: '/api/account',
      }).then(({ status }) => {
        expect(status).to.equal(200);
      });
    });
  });

  describe('role-based access', () => {
    it('should show admin menu for admin users', () => {
      cy.login(adminUsername, adminPassword);
      cy.visit('/');
      cy.get(navbarSelector).get(adminMenuSelector).should('exist');
    });

    it('should show entity menu for regular users', () => {
      cy.login(username, password);
      cy.visit('/');
      cy.get(navbarSelector).get(entityItemSelector).should('exist');
    });

    it('should allow admin to access user management via API', () => {
      cy.login(adminUsername, adminPassword);
      cy.authenticatedRequest({
        method: 'GET',
        url: '/api/admin/users',
      }).then(({ status }) => {
        expect(status).to.equal(200);
      });
    });

    it('should deny regular user access to admin API', () => {
      cy.login(username, password);
      cy.authenticatedRequest({
        method: 'GET',
        url: '/api/admin/users',
        failOnStatusCode: false,
      }).then(({ status }) => {
        expect(status).to.equal(403);
      });
    });
  });

  describe('authentication error handling', () => {
    it('should show error for invalid credentials via UI', () => {
      cy.visit('/login');
      cy.get(usernameLoginSelector).type('nonexistent');
      cy.get(passwordLoginSelector).type('wrongpassword');
      cy.get(submitLoginSelector).click();
      cy.wait('@authenticate').then(({ response }) => {
        expect(response?.statusCode).to.equal(401);
      });
      cy.get(errorLoginSelector).should('be.visible');
    });

    it('should return 401 for invalid credentials via API', () => {
      cy.request({
        method: 'POST',
        url: Cypress.env('authenticationUrl'),
        body: { username: 'invalid', password: 'invalid' },
        failOnStatusCode: false,
      }).then(({ status }) => {
        expect(status).to.equal(401);
      });
    });

    it('should return 401 for unauthenticated API access', () => {
      cy.request({
        method: 'GET',
        url: '/api/account',
        failOnStatusCode: false,
      }).then(({ status }) => {
        expect(status).to.equal(401);
      });
    });
  });

  describe('session persistence', () => {
    it('should maintain session across page navigations', () => {
      cy.login(username, password);
      cy.visit('/');
      cy.visit('/bank-account');
      cy.visit('/operation');
      cy.visit('/label');
      cy.authenticatedRequest({
        method: 'GET',
        url: '/api/account',
      }).then(({ status }) => {
        expect(status).to.equal(200);
      });
    });

    it('should maintain login session using cy.session caching', () => {
      cy.login(username, password);
      cy.authenticatedRequest({
        method: 'GET',
        url: '/api/account',
      }).then(({ status, body }) => {
        expect(status).to.equal(200);
        expect(body.login).to.equal(username);
      });

      cy.login(username, password);
      cy.authenticatedRequest({
        method: 'GET',
        url: '/api/account',
      }).then(({ status }) => {
        expect(status).to.equal(200);
      });
    });
  });
});
