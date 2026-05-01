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

describe('Label Management e2e test', () => {
  const labelPageUrl = '/label';
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';

  let label: any;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/labels+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/labels').as('postEntityRequest');
    cy.intercept('PUT', '/api/labels/*').as('putEntityRequest');
    cy.intercept('DELETE', '/api/labels/*').as('deleteEntityRequest');
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

  describe('form validation', () => {
    beforeEach(() => {
      cy.visit(`${labelPageUrl}/new`);
      cy.getEntityCreateUpdateHeading('Label');
    });

    it('should mark label field as required', () => {
      cy.get(`[data-cy="label"]`).should('have.class', classInvalid);
      cy.get(`[data-cy="label"]`).type('Groceries');
      cy.get(`[data-cy="label"]`).blur();
      cy.get(`[data-cy="label"]`).should('have.class', classValid);
    });

    it('should enforce minimum length on label field', () => {
      cy.get(`[data-cy="label"]`).type('ab');
      cy.get(`[data-cy="label"]`).blur();
      cy.get(`[data-cy="label"]`).should('have.class', classInvalid);
    });

    it('should accept valid label with minimum length met', () => {
      cy.get(`[data-cy="label"]`).type('abc');
      cy.get(`[data-cy="label"]`).blur();
      cy.get(`[data-cy="label"]`).should('have.class', classValid);
    });

    it('should not save with empty required fields', () => {
      cy.get(entityCreateSaveButtonSelector).should('be.disabled');
    });
  });

  describe('create and verify details', () => {
    it('should create a label and view its details', () => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/labels',
        body: { label: 'Detail Verification Label' },
      }).then(({ body }) => {
        label = body;

        cy.intercept(
          {
            method: 'GET',
            url: '/api/labels+(?*|)',
            times: 1,
          },
          {
            statusCode: 200,
            body: [label],
          },
        ).as('entitiesRequestInternal');

        cy.visit(labelPageUrl);
        cy.wait('@entitiesRequestInternal');

        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('label');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
      });
    });
  });

  describe('update label', () => {
    beforeEach(() => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/labels',
        body: { label: 'Original Label Name' },
      }).then(({ body }) => {
        label = body;

        cy.intercept(
          {
            method: 'GET',
            url: '/api/labels+(?*|)',
            times: 1,
          },
          {
            statusCode: 200,
            body: [label],
          },
        ).as('entitiesRequestInternal');
      });

      cy.visit(labelPageUrl);
      cy.wait('@entitiesRequestInternal');
    });

    it('should update the label name', () => {
      cy.get(entityEditButtonSelector).first().click();
      cy.getEntityCreateUpdateHeading('Label');

      cy.get(`[data-cy="label"]`).clear();
      cy.get(`[data-cy="label"]`).type('Updated Label Name');
      cy.get(`[data-cy="label"]`).should('have.value', 'Updated Label Name');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@putEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
        expect(response?.body.label).to.equal('Updated Label Name');
      });
    });
  });

  describe('multiple labels management', () => {
    let label2: any;

    beforeEach(() => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/labels',
        body: { label: 'Label Alpha' },
      })
        .then(({ body }) => {
          label = body;
          return cy.authenticatedRequest({
            method: 'POST',
            url: '/api/labels',
            body: { label: 'Label Beta' },
          });
        })
        .then(({ body }) => {
          label2 = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/labels+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [label, label2],
            },
          ).as('entitiesRequestInternal');
        });

      cy.visit(labelPageUrl);
      cy.wait('@entitiesRequestInternal');
    });

    afterEach(() => {
      if (label2) {
        cy.authenticatedRequest({
          method: 'DELETE',
          url: `/api/labels/${label2.id}`,
        }).then(() => {
          label2 = undefined;
        });
      }
    });

    it('should display multiple labels in the table', () => {
      cy.get(entityTableSelector).should('exist');
      cy.get(entityTableSelector).find('tr').should('have.length.greaterThan', 1);
    });

    it('should delete one label from the list', () => {
      cy.get(entityDeleteButtonSelector).last().click();
      cy.getEntityDeleteDialogHeading('label').should('exist');
      cy.get(entityConfirmDeleteButtonSelector).click();
      cy.wait('@deleteEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(204);
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });

      label2 = undefined;
    });
  });

  describe('API-level label CRUD', () => {
    it('should create a label via API', () => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/labels',
        body: { label: 'API Created Label' },
      }).then(({ body, status }) => {
        label = body;
        expect(status).to.equal(201);
        expect(body.label).to.equal('API Created Label');
        expect(body.id).to.be.a('number');
      });
    });

    it('should read a label via API', () => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/labels',
        body: { label: 'API Read Label' },
      })
        .then(({ body }) => {
          label = body;
          return cy.authenticatedRequest({
            method: 'GET',
            url: `/api/labels/${body.id}`,
          });
        })
        .then(({ body, status }) => {
          expect(status).to.equal(200);
          expect(body.label).to.equal('API Read Label');
        });
    });

    it('should update a label via API', () => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/labels',
        body: { label: 'API Update Test' },
      })
        .then(({ body }) => {
          label = body;
          return cy.authenticatedRequest({
            method: 'PUT',
            url: `/api/labels/${body.id}`,
            body: { ...body, label: 'API Updated Label' },
          });
        })
        .then(({ body, status }) => {
          expect(status).to.equal(200);
          expect(body.label).to.equal('API Updated Label');
          label = body;
        });
    });

    it('should delete a label via API', () => {
      cy.authenticatedRequest({
        method: 'POST',
        url: '/api/labels',
        body: { label: 'API Delete Label' },
      })
        .then(({ body }) => {
          return cy.authenticatedRequest({
            method: 'DELETE',
            url: `/api/labels/${body.id}`,
          });
        })
        .then(({ status }) => {
          expect(status).to.equal(204);
          label = undefined;
        });
    });
  });
});
