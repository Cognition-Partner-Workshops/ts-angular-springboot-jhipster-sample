# Test Automation Framework Analysis

## 1. Overview

This document provides a comprehensive analysis of the test automation infrastructure in the JHipster Sample Application (Angular + Spring Boot monolith for financial account management).

The application manages three core domain entities:

- **Bank Accounts** — name, balance, associated user
- **Operations** (transactions) — date, description, amount, associated bank account and labels
- **Labels** — categorization tags that can be assigned to operations

---

## 2. Testing Layers

### 2.1 End-to-End Testing (Cypress)

| Attribute         | Value                                          |
| ----------------- | ---------------------------------------------- |
| **Framework**     | Cypress                                        |
| **Config file**   | `cypress.config.ts`                            |
| **Base URL**      | `http://localhost:8080/`                       |
| **Spec pattern**  | `src/test/javascript/cypress/e2e/**/*.cy.ts`   |
| **Support file**  | `src/test/javascript/cypress/support/index.ts` |
| **Fixtures**      | `src/test/javascript/cypress/fixtures/`        |
| **Retries**       | 2                                              |
| **Viewport**      | 1200 × 720                                     |
| **Audits config** | `cypress-audits.config.ts` (Lighthouse/pa11y)  |

### 2.2 Unit / Integration Testing (Vitest + Angular TestBed)

| Attribute           | Value                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------- |
| **Framework**       | Vitest (not Jest)                                                                             |
| **Imports**         | `import { describe, it, expect, beforeEach, afterEach } from 'vitest'`                        |
| **Angular testing** | `@angular/core/testing` (`TestBed`), `@angular/common/http/testing` (`HttpTestingController`) |
| **Spec pattern**    | `src/main/webapp/**/*.spec.ts`                                                                |
| **Test samples**    | `*.test-samples.ts` files alongside each entity                                               |

### 2.3 Backend Integration Testing (Java / Spring Boot)

| Attribute      | Value                                              |
| -------------- | -------------------------------------------------- |
| **Framework**  | JUnit 5 + Spring Boot Test                         |
| **Location**   | `src/test/java/io/github/jhipster/sample/`         |
| **Containers** | Testcontainers (PostgreSQL via `SqlTestContainer`) |
| **Annotation** | `@IntegrationTest`                                 |

### 2.4 Performance Testing (Gatling)

| Attribute       | Value                                                                |
| --------------- | -------------------------------------------------------------------- |
| **Framework**   | Gatling                                                              |
| **Location**    | `src/test/java/gatling/simulations/`                                 |
| **Simulations** | `BankAccountGatlingTest`, `LabelGatlingTest`, `OperationGatlingTest` |
| **Config**      | `src/test/gatling/conf/gatling.conf`                                 |

---

## 3. Cypress Support Modules (Reusable Components)

The Cypress support layer is organized into 5 modules, all loaded via `support/index.ts`:

### 3.1 `commands.ts` — Core Selectors & Auth Commands

**Exported Selectors:**

| Category | Selector Constant                   | CSS Selector                             |
| -------- | ----------------------------------- | ---------------------------------------- |
| Navbar   | `navbarSelector`                    | `[data-cy="navbar"]`                     |
| Navbar   | `adminMenuSelector`                 | `[data-cy="adminMenu"]`                  |
| Navbar   | `accountMenuSelector`               | `[data-cy="accountMenu"]`                |
| Navbar   | `registerItemSelector`              | `[data-cy="register"]`                   |
| Navbar   | `settingsItemSelector`              | `[data-cy="settings"]`                   |
| Navbar   | `passwordItemSelector`              | `[data-cy="passwordItem"]`               |
| Navbar   | `loginItemSelector`                 | `[data-cy="login"]`                      |
| Navbar   | `logoutItemSelector`                | `[data-cy="logout"]`                     |
| Navbar   | `entityItemSelector`                | `[data-cy="entity"]`                     |
| Login    | `titleLoginSelector`                | `[data-cy="loginTitle"]`                 |
| Login    | `errorLoginSelector`                | `[data-cy="loginError"]`                 |
| Login    | `usernameLoginSelector`             | `[data-cy="username"]`                   |
| Login    | `passwordLoginSelector`             | `[data-cy="password"]`                   |
| Login    | `forgetYourPasswordSelector`        | `[data-cy="forgetYourPasswordSelector"]` |
| Login    | `submitLoginSelector`               | `[data-cy="submit"]`                     |
| Register | `usernameRegisterSelector`          | `[data-cy="username"]`                   |
| Register | `emailRegisterSelector`             | `[data-cy="email"]`                      |
| Register | `firstPasswordRegisterSelector`     | `[data-cy="firstPassword"]`              |
| Register | `secondPasswordRegisterSelector`    | `[data-cy="secondPassword"]`             |
| Register | `submitRegisterSelector`            | `[data-cy="submit"]`                     |
| Settings | `firstNameSettingsSelector`         | `[data-cy="firstname"]`                  |
| Settings | `lastNameSettingsSelector`          | `[data-cy="lastname"]`                   |
| Settings | `emailSettingsSelector`             | `[data-cy="email"]`                      |
| Settings | `submitSettingsSelector`            | `[data-cy="submit"]`                     |
| Password | `currentPasswordSelector`           | `[data-cy="currentPassword"]`            |
| Password | `newPasswordSelector`               | `[data-cy="newPassword"]`                |
| Password | `confirmPasswordSelector`           | `[data-cy="confirmPassword"]`            |
| Password | `submitPasswordSelector`            | `[data-cy="submit"]`                     |
| Reset    | `emailResetPasswordSelector`        | `[data-cy="emailResetPassword"]`         |
| Reset    | `submitInitResetPasswordSelector`   | `[data-cy="submit"]`                     |
| Admin    | `userManagementPageHeadingSelector` | `[data-cy="userManagementPageHeading"]`  |
| Admin    | `swaggerFrameSelector`              | `iframe[data-cy="swagger-frame"]`        |
| Admin    | `swaggerPageSelector`               | `[id="swagger-ui"]`                      |
| Admin    | `metricsPageHeadingSelector`        | `[data-cy="metricsPageHeading"]`         |
| Admin    | `healthPageHeadingSelector`         | `[data-cy="healthPageHeading"]`          |
| Admin    | `logsPageHeadingSelector`           | `[data-cy="logsPageHeading"]`            |
| Admin    | `configurationPageHeadingSelector`  | `[data-cy="configurationPageHeading"]`   |

**Exported Utilities:**

- `classInvalid` = `'ng-invalid'`
- `classValid` = `'ng-valid'`

**Custom Commands:**

- `cy.authenticatedRequest(data)` — wraps `cy.request()` with JWT bearer token from session storage
- `cy.login(username, password)` — session-cached login via `/api/authenticate`

### 3.2 `entity.ts` — Entity CRUD Selectors & Commands

**Exported Selectors:**

| Selector Constant                   | CSS Selector                            | Notes                        |
| ----------------------------------- | --------------------------------------- | ---------------------------- |
| `entityTableSelector`               | `[data-cy="entityTable"]`               |                              |
| `entityCreateButtonSelector`        | `[data-cy="entityCreateButton"]`        |                              |
| `entityCreateSaveButtonSelector`    | `[data-cy="entityCreateSaveButton"]`    |                              |
| `entityCreateCancelButtonSelector`  | `[data-cy="entityCreateCancelButton"]`  |                              |
| `entityDetailsButtonSelector`       | `[data-cy="entityDetailsButton"]`       | Can return multiple elements |
| `entityDetailsBackButtonSelector`   | `[data-cy="entityDetailsBackButton"]`   |                              |
| `entityEditButtonSelector`          | `[data-cy="entityEditButton"]`          |                              |
| `entityDeleteButtonSelector`        | `[data-cy="entityDeleteButton"]`        |                              |
| `entityConfirmDeleteButtonSelector` | `[data-cy="entityConfirmDeleteButton"]` |                              |

**Custom Commands:**

- `cy.getEntityHeading(entityName)` — selects `[data-cy="${entityName}Heading"]`
- `cy.getEntityCreateUpdateHeading(entityName)` — selects `[data-cy="${entityName}CreateUpdateHeading"]`
- `cy.getEntityDetailsHeading(entityInstanceName)` — selects `[data-cy="${entityInstanceName}DetailsHeading"]`
- `cy.getEntityDeleteDialogHeading(entityInstanceName)` — selects `[data-cy="${entityInstanceName}DeleteDialogHeading"]`
- `cy.setFieldImageAsBytesOfEntity(fieldName, fileName, mimeType)` — uploads fixture image to file input
- `cy.setFieldSelectToLastOfEntity(fieldName)` — selects the last option in a dropdown

### 3.3 `account.ts` — Account API Commands

- `cy.getAccount()` — GET `/api/account`, returns body
- `cy.saveAccount(account)` — POST `/api/account`, saves account settings

### 3.4 `navbar.ts` — Navigation Commands

- `cy.clickOnLoginItem()` — opens account menu → clicks login
- `cy.clickOnLogoutItem()` — opens account menu → clicks logout
- `cy.clickOnRegisterItem()` — opens account menu → clicks register
- `cy.clickOnSettingsItem()` — opens account menu → clicks settings
- `cy.clickOnPasswordItem()` — opens account menu → clicks password
- `cy.clickOnAdminMenuItem(item)` — opens admin menu → clicks item by href
- `cy.clickOnEntityMenuItem(entityName)` — opens entity menu → clicks entity by href

### 3.5 `management.ts` — Management API Commands

- `cy.getManagementInfo()` — GET `/management/info`, returns body

---

## 4. Existing Test Coverage

### 4.1 Account Tests (`e2e/account/`)

| File                        | Scenarios Covered                                                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `login-page.cy.ts`          | Sign-in greeting, direct `/login` visit, requires username, requires password, incorrect password error, successful login          |
| `logout.cy.ts`              | Logout → login item visible                                                                                                        |
| `password-page.cy.ts`       | Menu access, current/new/confirm password validation, incorrect password rejection, successful password change                     |
| `register-page.cy.ts`       | Menu access, page load, username validation, email format validation, password validation, password match, successful registration |
| `reset-password-page.cy.ts` | Email validation, init reset password                                                                                              |
| `settings-page.cy.ts`       | Menu access, update firstname/lastname/email, duplicate email rejection                                                            |

### 4.2 Entity Tests (`e2e/entity/`)

Each entity file follows the **same JHipster-generated pattern**:

| Scenario                     | bank-account | operation | label | authority |
| ---------------------------- | ------------ | --------- | ----- | --------- |
| Menu navigation to list page | ✓            | ✓         | ✓     | ✓         |
| Create button → cancel       | ✓            | ✓         | ✓     | ✓         |
| View details → back          | ✓            | ✓         | ✓     | ✓         |
| Edit → cancel                | ✓            | ✓         | ✓     | —         |
| Edit → save                  | ✓            | ✓         | ✓     | —         |
| Delete → confirm             | ✓            | ✓         | ✓     | ✓         |
| Create new instance          | ✓            | ✓         | ✓     | ✓         |

### 4.3 Administration Tests (`e2e/administration/`)

- User management page load
- User management CRUD (currently `describe.skip`-ped)
- Metrics, health, logs, configuration page loads
- Swagger/API docs page load

### 4.4 Lighthouse Audits (`e2e/lighthouse.audits.ts`)

- Homepage performance/accessibility/SEO/best-practices thresholds

---

## 5. Test Data Management Approach

- **API-seeded data**: Tests create entities via `cy.authenticatedRequest()` in `beforeEach` hooks
- **API-cleaned data**: Tests delete entities via `cy.authenticatedRequest()` in `afterEach` hooks
- **Intercepted responses**: Tests intercept GET/POST/DELETE requests and sometimes stub responses
- **Sample data**: Inline sample objects (e.g., `{ name: 'pfft truly psst', balance: 23331.08 }`)
- **Default credentials**: `user/user` for regular user, `admin/admin` for admin (overridable via `E2E_USERNAME`/`E2E_PASSWORD` env vars)
- **Session caching**: `cy.login()` uses `cy.session()` for efficient re-authentication

---

## 6. Design Patterns

1. **Selector-based Page Objects** — selectors exported as constants from support files, not class-based page objects
2. **Custom Cypress Commands** — all reusable interactions registered via `Cypress.Commands.add()`
3. **API-first test data** — entities created/deleted via API, not via UI
4. **Intercept-based assertions** — `cy.intercept()` + `cy.wait()` for verifying API calls
5. **Session-cached auth** — `cy.session()` prevents redundant login flows
6. **Fixture separation** — test images stored in `cypress/fixtures/`
7. **TypeScript declarations** — custom commands declared in `global Cypress.Chainable` interface

---

## 7. Gaps Identified (New Scenario Opportunities)

### 7.1 Bank Account Management

- Form validation (required name, required balance, negative balance handling)
- Update balance with actual field modification and value verification
- Verify details page content (name, balance values displayed)
- Multiple accounts in list view

### 7.2 Financial Operations

- Create operation with bank account association (select dropdown)
- Create operation with label assignment (multi-select)
- Verify operation details content (date, amount, description, associated bank account, labels)
- Paginated list navigation

### 7.3 Label Management

- Form validation (required label field)
- Verify label details content
- Labels displayed in operation details

### 7.4 Cross-Cutting Concerns

- Role-based access: regular user vs admin access to entity pages
- Unauthorized API request handling
- Form validation CSS classes across entities
- Navigation flow: entity list → details → edit → save → back to list
- Session expiry / JWT token refresh

---

## 8. Folder Structure

```
src/test/javascript/cypress/
├── e2e/
│   ├── account/
│   │   ├── login-page.cy.ts
│   │   ├── logout.cy.ts
│   │   ├── password-page.cy.ts
│   │   ├── register-page.cy.ts
│   │   ├── reset-password-page.cy.ts
│   │   └── settings-page.cy.ts
│   ├── administration/
│   │   └── administration.cy.ts
│   ├── entity/
│   │   ├── authority.cy.ts
│   │   ├── bank-account.cy.ts
│   │   ├── label.cy.ts
│   │   └── operation.cy.ts
│   └── lighthouse.audits.ts
├── fixtures/
│   └── integration-test.png
├── plugins/
│   └── index.ts
├── support/
│   ├── account.ts
│   ├── commands.ts
│   ├── entity.ts
│   ├── index.ts
│   ├── management.ts
│   └── navbar.ts
└── tsconfig.json
```
