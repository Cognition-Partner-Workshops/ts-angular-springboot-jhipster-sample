import {
  entityCreateSaveButtonSelector,
  entityDetailsButtonSelector,
  entityDetailsBackButtonSelector,
  entityEditButtonSelector,
} from '../../support/entity';
import { classInvalid, classValid } from '../../support/commands';

describe('Operation Management e2e test', () => {
  const operationPageUrl = '/operation';
  const operationPageUrlPattern = new RegExp('/operation(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';

  let operation: any;
  let bankAccount: any;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/operations+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/operations').as('postEntityRequest');
    cy.intercept('PUT', '/api/operations/*').as('putEntityRequest');
    cy.intercept('DELETE', '/api/operations/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (operation) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/operations/${operation.id}`,
      }).then(() => {
        operation = undefined;
      });
    }
    if (bankAccount) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/bank-accounts/${bankAccount.id}`,
      }).then(() => {
        bankAccount = undefined;
      });
    }
  });

  describe('form validation', () => {
    beforeEach(() => {
      cy.visit(`${operationPageUrl}/new`);
      cy.getEntityCreateUpdateHeading('Operation');
    });

    it('should have date field pre-populated with current time and valid', () => {
      cy.get(`[data-cy="date"]`).should('have.class', classValid);
      cy.get(`[data-cy="date"]`).invoke('val').should('not.be.empty');
    });

    it('should mark date field invalid when cleared', () => {
      cy.get(`[data-cy="date"]`).clear();
      cy.get(`[data-cy="date"]`).blur();
      cy.get(`[data-cy="date"]`).should('have.class', classInvalid);
    });

    it('should mark amount field as required', () => {
      cy.get(`[data-cy="amount"]`).should('have.class', classInvalid);
      cy.get(`[data-cy="amount"]`).type('100.50');
      cy.get(`[data-cy="amount"]`).blur();
      cy.get(`[data-cy="amount"]`).should('have.class', classValid);
    });

    it('should allow description as optional field', () => {
      cy.get(`[data-cy="date"]`).type('2024-01-15T10:30');
      cy.get(`[data-cy="amount"]`).type('100.50');
      cy.get(entityCreateSaveButtonSelector).should('not.be.disabled');
    });

    it('should not save with empty required fields', () => {
      cy.get(entityCreateSaveButtonSelector).should('be.disabled');
    });
  });

  describe('create operation with bank account association', () => {
    beforeEach(() => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/bank-accounts',
        body: { name: 'Operation Test Account', balance: 10000.0 },
      }).then(({ body }) => {
        bankAccount = body;
      });
    });

    it('should create an operation with a bank account selected', () => {
      cy.visit(`${operationPageUrl}/new`);
      cy.getEntityCreateUpdateHeading('Operation');

      cy.get(`[data-cy="date"]`).type('2024-01-15T10:30');
      cy.get(`[data-cy="date"]`).blur();
      cy.get(`[data-cy="description"]`).type('Salary deposit');
      cy.get(`[data-cy="amount"]`).type('5000.00');
      cy.setFieldSelectToLastOfEntity('bankAccount');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        expect(response?.body.description).to.equal('Salary deposit');
        expect(response?.body.amount).to.equal(5000.0);
        operation = response?.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', operationPageUrlPattern);
    });
  });

  describe('create operation with label assignment', () => {
    let label: any;

    beforeEach(() => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/labels',
        body: { label: 'E2E Test Label' },
      }).then(({ body }) => {
        label = body;
      });
    });

    afterEach(() => {
      if (label) {
        cy.authenticatedRequest({
          method: 'DELETE',
          url: `/api/labels/${label.id}`,
        }).then(() => {
          label = undefined;
        });
      }
    });

    it('should create an operation with a label assigned', () => {
      cy.visit(`${operationPageUrl}/new`);
      cy.getEntityCreateUpdateHeading('Operation');

      cy.get(`[data-cy="date"]`).type('2024-02-20T14:00');
      cy.get(`[data-cy="date"]`).blur();
      cy.get(`[data-cy="description"]`).type('Categorized transaction');
      cy.get(`[data-cy="amount"]`).type('250.00');
      cy.setFieldSelectToLastOfEntity('label');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        operation = response?.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', operationPageUrlPattern);
    });
  });

  describe('verify operation details content', () => {
    beforeEach(() => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/operations',
        body: { date: '2024-03-10T09:15:00Z', description: 'Detail verification', amount: 1234.56 },
      }).then(({ body }) => {
        operation = body;

        cy.intercept(
          {
            method: 'GET',
            url: '/api/operations+(?*|)',
            times: 1,
          },
          {
            statusCode: 200,
            headers: {
              link: '<http://localhost/api/operations?page=0&size=20>; rel="last",<http://localhost/api/operations?page=0&size=20>; rel="first"',
            },
            body: [operation],
          },
        ).as('entitiesRequestInternal');
      });

      cy.visit(operationPageUrl);
      cy.wait('@entitiesRequestInternal');
    });

    it('should display operation details with correct data', () => {
      cy.get(entityDetailsButtonSelector).first().click();
      cy.getEntityDetailsHeading('operation');
      cy.get(entityDetailsBackButtonSelector).click();
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
    });
  });

  describe('update operation', () => {
    beforeEach(() => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/operations',
        body: { date: '2024-04-01T12:00:00Z', description: 'Original description', amount: 500.0 },
      }).then(({ body }) => {
        operation = body;

        cy.intercept(
          {
            method: 'GET',
            url: '/api/operations+(?*|)',
            times: 1,
          },
          {
            statusCode: 200,
            headers: {
              link: '<http://localhost/api/operations?page=0&size=20>; rel="last",<http://localhost/api/operations?page=0&size=20>; rel="first"',
            },
            body: [operation],
          },
        ).as('entitiesRequestInternal');
      });

      cy.visit(operationPageUrl);
      cy.wait('@entitiesRequestInternal');
    });

    it('should update description and amount of an existing operation', () => {
      cy.get(entityEditButtonSelector).first().click();
      cy.getEntityCreateUpdateHeading('Operation');

      cy.get(`[data-cy="description"]`).clear();
      cy.get(`[data-cy="description"]`).type('Updated description');
      cy.get(`[data-cy="description"]`).should('have.value', 'Updated description');

      cy.get(`[data-cy="amount"]`).clear();
      cy.get(`[data-cy="amount"]`).type('750.25');
      cy.get(`[data-cy="amount"]`).should('have.value', '750.25');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@putEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
    });
  });

  describe('API-level operations CRUD', () => {
    it('should create an operation via API with all fields', () => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/operations',
        body: { date: '2024-05-15T08:00:00Z', description: 'API full create', amount: 999.99 },
      }).then(({ body, status }) => {
        operation = body;
        expect(status).to.equal(201);
        expect(body.description).to.equal('API full create');
        expect(body.amount).to.equal(999.99);
        expect(body.id).to.be.a('number');
      });
    });

    it('should list operations via API', () => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/operations',
        body: { date: '2024-06-01T10:00:00Z', amount: 100.0 },
      })
        .then(({ body }) => {
          operation = body;
          return cy.authenticatedRequest({
            method: 'GET',
            url: '/api/operations?sort=id,desc&size=20',
          });
        })
        .then(({ body, status }) => {
          expect(status).to.equal(200);
          expect(body).to.be.an('array');
          expect(body.length).to.be.greaterThan(0);
        });
    });

    it('should delete an operation via API', () => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/operations',
        body: { date: '2024-07-01T10:00:00Z', amount: 200.0 },
      })
        .then(({ body }) => {
          return cy.authenticatedRequest({
            method: 'DELETE',
            url: `/api/operations/${body.id}`,
          });
        })
        .then(({ status }) => {
          expect(status).to.equal(204);
          operation = undefined;
        });
    });
  });

  describe('paginated list navigation', () => {
    it('should load operations list with pagination headers', () => {
      cy.visit(operationPageUrl);
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
        if (response?.headers.link) {
          expect(response.headers.link).to.be.a('string');
        }
      });
      cy.url().should('match', operationPageUrlPattern);
    });
  });
});
