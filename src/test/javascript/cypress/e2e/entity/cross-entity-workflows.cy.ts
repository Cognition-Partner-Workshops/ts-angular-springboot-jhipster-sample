import {
  entityCreateSaveButtonSelector,
  entityDetailsButtonSelector,
  entityDetailsBackButtonSelector,
  entityEditButtonSelector,
} from '../../support/entity';

describe('Cross-Entity Workflows e2e test', () => {
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';

  let bankAccount: any;
  let operation: any;
  let label: any;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/bank-accounts+(?*|)').as('bankAccountsRequest');
    cy.intercept('GET', '/api/operations+(?*|)').as('operationsRequest');
    cy.intercept('GET', '/api/labels+(?*|)').as('labelsRequest');
    cy.intercept('POST', '/api/bank-accounts').as('postBankAccountRequest');
    cy.intercept('POST', '/api/operations').as('postOperationRequest');
    cy.intercept('POST', '/api/labels').as('postLabelRequest');
    cy.intercept('DELETE', '/api/bank-accounts/*').as('deleteBankAccountRequest');
    cy.intercept('DELETE', '/api/operations/*').as('deleteOperationRequest');
    cy.intercept('DELETE', '/api/labels/*').as('deleteLabelRequest');
  });

  afterEach(() => {
    if (operation) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/operations/${operation.id}`,
        failOnStatusCode: false,
      }).then(() => {
        operation = undefined;
      });
    }
    if (label) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/labels/${label.id}`,
        failOnStatusCode: false,
      }).then(() => {
        label = undefined;
      });
    }
    if (bankAccount) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/bank-accounts/${bankAccount.id}`,
        failOnStatusCode: false,
      }).then(() => {
        bankAccount = undefined;
      });
    }
  });

  describe('full financial workflow', () => {
    it('should create a bank account, then create an operation linked to it via API', () => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/bank-accounts',
        body: { name: 'Workflow Test Account', balance: 10000.0 },
      })
        .then(({ body, status }) => {
          expect(status).to.equal(201);
          bankAccount = body;

          return cy.authenticatedRequest({
            method: 'POST',
            url: '/api/operations',
            body: {
              date: '2024-01-15T10:00:00Z',
              description: 'Workflow transaction',
              amount: 500.0,
              bankAccount: { id: bankAccount.id, name: bankAccount.name, balance: bankAccount.balance },
            },
          });
        })
        .then(({ body, status }) => {
          expect(status).to.equal(201);
          operation = body;
          expect(operation.bankAccount).to.not.equal(null);
        });
    });

    it('should create a label, then create an operation with that label via API', () => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/labels',
        body: { label: 'Workflow Label' },
      })
        .then(({ body, status }) => {
          expect(status).to.equal(201);
          label = body;

          return cy.authenticatedRequest({
            method: 'POST',
            url: '/api/operations',
            body: {
              date: '2024-02-20T14:00:00Z',
              description: 'Labeled transaction',
              amount: 250.0,
              labels: [{ id: label.id, label: label.label }],
            },
          });
        })
        .then(({ body, status }) => {
          expect(status).to.equal(201);
          operation = body;
        });
    });
  });

  describe('navigation flow: entity list to details to edit to save to list', () => {
    beforeEach(() => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/bank-accounts',
        body: { name: 'Nav Flow Account', balance: 5000.0 },
      }).then(({ body }) => {
        bankAccount = body;

        cy.intercept(
          {
            method: 'GET',
            url: '/api/bank-accounts+(?*|)',
            times: 1,
          },
          {
            statusCode: 200,
            body: [bankAccount],
          },
        ).as('bankAccountsRequestInternal');
      });
    });

    it('should navigate: list → details → back → edit → save → list', () => {
      cy.visit('/bank-account');
      cy.wait('@bankAccountsRequestInternal');

      cy.get(entityDetailsButtonSelector).first().click();
      cy.getEntityDetailsHeading('bankAccount');

      cy.get(entityDetailsBackButtonSelector).click();
      cy.wait('@bankAccountsRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });

      cy.get(entityEditButtonSelector).first().click();
      cy.getEntityCreateUpdateHeading('BankAccount');
      cy.get(entityCreateSaveButtonSelector).click();
      cy.wait('@bankAccountsRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });

      cy.url().should('match', /\/bank-account(\?.*)?$/);
    });
  });

  describe('entity menu navigation', () => {
    it('should navigate to bank accounts via entity menu', () => {
      cy.visit('/');
      cy.clickOnEntityMenuItem('bank-account');
      cy.wait('@bankAccountsRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.getEntityHeading('BankAccount').should('exist');
    });

    it('should navigate to operations via entity menu', () => {
      cy.visit('/');
      cy.clickOnEntityMenuItem('operation');
      cy.wait('@operationsRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.getEntityHeading('Operation').should('exist');
    });

    it('should navigate to labels via entity menu', () => {
      cy.visit('/');
      cy.clickOnEntityMenuItem('label');
      cy.wait('@labelsRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.getEntityHeading('Label').should('exist');
    });
  });

  describe('data cleanup verification', () => {
    it('should delete operation before deleting associated bank account', () => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/bank-accounts',
        body: { name: 'Cleanup Test Account', balance: 1000.0 },
      })
        .then(({ body }) => {
          bankAccount = body;

          return cy.authenticatedRequest({
            method: 'POST',
            url: '/api/operations',
            body: {
              date: '2024-03-01T10:00:00Z',
              amount: 100.0,
              bankAccount: { id: bankAccount.id, name: bankAccount.name, balance: bankAccount.balance },
            },
          });
        })
        .then(({ body }) => {
          operation = body;

          return cy.authenticatedRequest({
            method: 'DELETE',
            url: `/api/operations/${operation.id}`,
          });
        })
        .then(({ status }) => {
          expect(status).to.equal(204);
          operation = undefined;

          return cy.authenticatedRequest({
            method: 'DELETE',
            url: `/api/bank-accounts/${bankAccount.id}`,
          });
        })
        .then(({ status }) => {
          expect(status).to.equal(204);
          bankAccount = undefined;
        });
    });
  });
});
