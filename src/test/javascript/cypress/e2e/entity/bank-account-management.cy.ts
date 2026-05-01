import {
  entityCreateSaveButtonSelector,
  entityDeleteButtonSelector,
  entityConfirmDeleteButtonSelector,
  entityDetailsButtonSelector,
  entityDetailsBackButtonSelector,
  entityEditButtonSelector,
  entityTableSelector,
} from '../../support/entity';
import { classInvalid, classValid } from '../../support/commands';

describe('BankAccount Management e2e test', () => {
  const bankAccountPageUrl = '/bank-account';
  const bankAccountPageUrlPattern = new RegExp('/bank-account(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';

  let bankAccount: any;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/bank-accounts+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/bank-accounts').as('postEntityRequest');
    cy.intercept('PUT', '/api/bank-accounts/*').as('putEntityRequest');
    cy.intercept('DELETE', '/api/bank-accounts/*').as('deleteEntityRequest');
  });

  afterEach(() => {
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
      cy.visit(`${bankAccountPageUrl}/new`);
      cy.getEntityCreateUpdateHeading('BankAccount');
    });

    it('should mark name field as required', () => {
      cy.get(`[data-cy="name"]`).should('have.class', classInvalid);
      cy.get(`[data-cy="name"]`).type('Test Account');
      cy.get(`[data-cy="name"]`).blur();
      cy.get(`[data-cy="name"]`).should('have.class', classValid);
    });

    it('should mark balance field as required', () => {
      cy.get(`[data-cy="balance"]`).should('have.class', classInvalid);
      cy.get(`[data-cy="balance"]`).type('1000');
      cy.get(`[data-cy="balance"]`).blur();
      cy.get(`[data-cy="balance"]`).should('have.class', classValid);
    });

    it('should not save with empty required fields', () => {
      cy.get(entityCreateSaveButtonSelector).should('be.disabled');
    });
  });

  describe('create and verify details', () => {
    it('should create a bank account and verify details page content', () => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/bank-accounts',
        body: { name: 'Savings Account E2E', balance: 5000.75 },
      }).then(({ body }) => {
        bankAccount = body;

        cy.visit(`${bankAccountPageUrl}/${bankAccount.id}/view`);
        cy.getEntityDetailsHeading('bankAccount');
        cy.get('[data-cy="bankAccountDetailsHeading"]').should('exist');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.url().should('match', bankAccountPageUrlPattern);
      });
    });
  });

  describe('update balance', () => {
    beforeEach(() => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/bank-accounts',
        body: { name: 'Balance Update Test', balance: 1000.0 },
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
        ).as('entitiesRequestInternal');
      });

      cy.visit(bankAccountPageUrl);
      cy.wait('@entitiesRequestInternal');
    });

    it('should update the balance of an existing bank account', () => {
      cy.get(entityEditButtonSelector).first().click();
      cy.getEntityCreateUpdateHeading('BankAccount');

      cy.get(`[data-cy="balance"]`).clear();
      cy.get(`[data-cy="balance"]`).type('2500.50');
      cy.get(`[data-cy="balance"]`).should('have.value', '2500.50');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@putEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
        expect(response?.body.balance).to.equal(2500.5);
      });
    });

    it('should update the name of an existing bank account', () => {
      cy.get(entityEditButtonSelector).first().click();
      cy.getEntityCreateUpdateHeading('BankAccount');

      cy.get(`[data-cy="name"]`).clear();
      cy.get(`[data-cy="name"]`).type('Updated Account Name');
      cy.get(`[data-cy="name"]`).should('have.value', 'Updated Account Name');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@putEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
        expect(response?.body.name).to.equal('Updated Account Name');
      });
    });
  });

  describe('multiple accounts in list', () => {
    let bankAccount2: any;

    beforeEach(() => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/bank-accounts',
        body: { name: 'Account One', balance: 1000.0 },
      })
        .then(({ body }) => {
          bankAccount = body;
          return cy.authenticatedRequest({
            method: 'POST',
            url: '/api/bank-accounts',
            body: { name: 'Account Two', balance: 2000.0 },
          });
        })
        .then(({ body }) => {
          bankAccount2 = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/bank-accounts+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [bankAccount, bankAccount2],
            },
          ).as('entitiesRequestInternal');
        });

      cy.visit(bankAccountPageUrl);
      cy.wait('@entitiesRequestInternal');
    });

    afterEach(() => {
      if (bankAccount2) {
        cy.authenticatedRequest({
          method: 'DELETE',
          url: `/api/bank-accounts/${bankAccount2.id}`,
        }).then(() => {
          bankAccount2 = undefined;
        });
      }
    });

    it('should display multiple accounts in the table', () => {
      cy.get(entityTableSelector).should('exist');
      cy.get(entityTableSelector).find('tr').should('have.length.greaterThan', 1);
    });

    it('should allow viewing details of each account', () => {
      cy.get(entityDetailsButtonSelector).first().click();
      cy.getEntityDetailsHeading('bankAccount');
      cy.get(entityDetailsBackButtonSelector).click();
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
    });

    it('should allow deleting one account while keeping the other', () => {
      cy.get(entityDeleteButtonSelector).last().click();
      cy.getEntityDeleteDialogHeading('bankAccount').should('exist');
      cy.get(entityConfirmDeleteButtonSelector).click();
      cy.wait('@deleteEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(204);
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });

      bankAccount2 = undefined;
    });
  });

  describe('API-level CRUD verification', () => {
    it('should create a bank account via API and verify response', () => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/bank-accounts',
        body: { name: 'API Test Account', balance: 3000.0 },
      }).then(({ body, status }) => {
        bankAccount = body;
        expect(status).to.equal(201);
        expect(body.name).to.equal('API Test Account');
        expect(body.balance).to.equal(3000.0);
        expect(body.id).to.be.a('number');
      });
    });

    it('should read a bank account via API', () => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/bank-accounts',
        body: { name: 'API Read Test', balance: 4000.0 },
      })
        .then(({ body }) => {
          bankAccount = body;
          return cy.authenticatedRequest({
            method: 'GET',
            url: `/api/bank-accounts/${body.id}`,
          });
        })
        .then(({ body, status }) => {
          expect(status).to.equal(200);
          expect(body.name).to.equal('API Read Test');
          expect(body.balance).to.equal(4000.0);
        });
    });

    it('should update a bank account via API', () => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/bank-accounts',
        body: { name: 'API Update Test', balance: 5000.0 },
      })
        .then(({ body }) => {
          bankAccount = body;
          return cy.authenticatedRequest({
            method: 'PUT',
            url: `/api/bank-accounts/${body.id}`,
            body: { ...body, balance: 7500.0 },
          });
        })
        .then(({ body, status }) => {
          expect(status).to.equal(200);
          expect(body.balance).to.equal(7500.0);
          bankAccount = body;
        });
    });

    it('should delete a bank account via API', () => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/bank-accounts',
        body: { name: 'API Delete Test', balance: 6000.0 },
      })
        .then(({ body }) => {
          return cy.authenticatedRequest({
            method: 'DELETE',
            url: `/api/bank-accounts/${body.id}`,
          });
        })
        .then(({ status }) => {
          expect(status).to.equal(204);
          bankAccount = undefined;
        });
    });
  });
});
