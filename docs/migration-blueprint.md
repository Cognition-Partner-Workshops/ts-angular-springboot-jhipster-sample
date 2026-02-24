# JHipster Monolith Migration Blueprint

## Application Overview

| Property | Value |
|---|---|
| **App Name** | JhipsterSampleApplication |
| **Base Package** | `io.github.jhipster.sample` |
| **Frontend** | Angular (standalone components, lazy-loaded routes) |
| **Backend** | Spring Boot 3.x + Spring Security (JWT) |
| **Database** | JPA/Hibernate with Liquibase migrations |
| **Auth Mechanism** | Stateless JWT (Bearer token) |
| **Build** | Maven (backend) + npm/webpack (frontend) |
| **Caching** | Ehcache (Hibernate L2 cache) |

---

## 1. Angular UI Modules

### 1.1 Home Module (`src/main/webapp/app/home/`)

| File | Purpose |
|---|---|
| `home.ts` | `Home` component; subscribes to `AccountService.getAuthenticationState()` to show logged-in user info |
| `home.html` | Template with login prompt or welcome message |
| `home.scss` | Component styles |

**API Dependencies:** `GET /api/account` (via `AccountService.identity()`)

---

### 1.2 Login Module (`src/main/webapp/app/login/`)

| File | Purpose |
|---|---|
| `login.ts` | `LoginComponent`; collects username/password/rememberMe, calls `LoginService.login()` |
| `login.service.ts` | `LoginService`; delegates to `AuthServerProvider.login()` then `AccountService.identity()` |
| `login.model.ts` | `Login` class: `{ username, password, rememberMe }` |
| `login.html` | Login form template |

**API Dependencies:** `POST /api/authenticate`, `GET /api/account`

---

### 1.3 Account Module (`src/main/webapp/app/account/`)

Route: `/account` (lazy-loaded)

| Sub-module | Route | Component | Service | API Endpoint |
|---|---|---|---|---|
| **activate** | `/account/activate` | `ActivateComponent` | `ActivateService` | `GET /api/activate?key=` |
| **register** | `/account/register` | `RegisterComponent` | `RegisterService` | `POST /api/register` |
| **password** | `/account/password` | `PasswordComponent` | `PasswordService` | `POST /api/account/change-password` |
| **password-reset/init** | `/account/reset/request` | `PasswordResetInitComponent` | `PasswordResetInitService` | `POST /api/account/reset-password/init` |
| **password-reset/finish** | `/account/reset/finish` | `PasswordResetFinishComponent` | `PasswordResetFinishService` | `POST /api/account/reset-password/finish` |
| **settings** | `/account/settings` | `Settings` | `AccountService` (core) | `GET /api/account`, `POST /api/account` |

**Models:**
- `Registration`: `{ login, email, password, langKey }`
- `Login` model from `login.model.ts`: `{ username, password, rememberMe }`

---

### 1.4 Admin Module (`src/main/webapp/app/admin/`)

Route: `/admin` (lazy-loaded, guarded by `UserRouteAccessService`, requires `ROLE_ADMIN`)

| Sub-module | Route | Component | Service | API Endpoint |
|---|---|---|---|---|
| **user-management** | `/admin/user-management` | List/Detail/Update/Delete components | `UserManagementService` | `GET/POST/PUT/DELETE /api/admin/users`, `GET /api/authorities` |
| **docs** | `/admin/docs` | `DocsComponent` | N/A (embedded Swagger UI iframe) | Swagger/OpenAPI UI |
| **configuration** | `/admin/configuration` | `ConfigurationComponent` | N/A | `GET /management/configprops`, `GET /management/env` |
| **health** | `/admin/health` | `HealthComponent` | N/A | `GET /management/health` |
| **logs** | `/admin/logs` | `LogsComponent` | N/A | `GET/PUT /management/loggers` |
| **metrics** | `/admin/metrics` | `MetricsComponent` | N/A | `GET /management/jhi-metrics`, `GET /management/threaddump` |

**Admin User Model (`user-management.model.ts`):**
```typescript
interface IUser {
  id: number | null;
  login?: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
  activated?: boolean;
  langKey?: string;
  authorities?: string[];
  createdBy?: string;
  createdDate?: Date;
  lastModifiedBy?: string;
  lastModifiedDate?: Date;
}
```

---

### 1.5 Entities Module (`src/main/webapp/app/entities/`)

Route: `/` (lazy-loaded via `entity.routes.ts`)

#### 1.5.1 BankAccount Entity (`entities/bank-account/`)

| Sub-component | Purpose |
|---|---|
| `list/bank-account.ts` | List all bank accounts |
| `detail/bank-account-detail.ts` | View single bank account |
| `update/bank-account-update.ts` | Create/edit bank account |
| `delete/bank-account-delete-dialog.ts` | Confirm deletion |
| `service/bank-account.service.ts` | CRUD via `api/bank-accounts` |
| `route/bank-account-routing-resolve.service.ts` | Route resolver |

**Model (`bank-account.model.ts`):**
```typescript
interface IBankAccount {
  id: number;
  name?: string | null;
  balance?: number | null;
  user?: Pick<IUser, 'id' | 'login'> | null;
}
```

#### 1.5.2 Label Entity (`entities/label/`)

| Sub-component | Purpose |
|---|---|
| `list/label.ts` | List all labels |
| `detail/label-detail.ts` | View single label |
| `update/label-update.ts` | Create/edit label |
| `delete/label-delete-dialog.ts` | Confirm deletion |
| `service/label.service.ts` | CRUD via `api/labels` |
| `route/label-routing-resolve.service.ts` | Route resolver |

**Model (`label.model.ts`):**
```typescript
interface ILabel {
  id: number;
  label?: string | null;
  operations?: IOperation[] | null;
}
```

#### 1.5.3 Operation Entity (`entities/operation/`)

| Sub-component | Purpose |
|---|---|
| `list/operation.ts` | Paginated list of operations |
| `detail/operation-detail.ts` | View single operation |
| `update/operation-update.ts` | Create/edit operation |
| `delete/operation-delete-dialog.ts` | Confirm deletion |
| `service/operation.service.ts` | CRUD via `api/operations` (with date conversion) |
| `route/operation-routing-resolve.service.ts` | Route resolver |

**Model (`operation.model.ts`):**
```typescript
interface IOperation {
  id: number;
  date?: dayjs.Dayjs | null;     // Sent as ISO string, received as Instant
  description?: string | null;
  amount?: number | null;
  bankAccount?: IBankAccount | null;
  labels?: ILabel[] | null;
}
```

#### 1.5.4 Authority Entity (`entities/admin/authority/`)

| Sub-component | Purpose |
|---|---|
| `list/` | List all authorities |
| `detail/` | View single authority |
| `update/` | Create authority |
| `delete/` | Confirm deletion |
| `service/authority.service.ts` | CRUD via `api/authorities` |

**Model (`authority.model.ts`):**
```typescript
interface IAuthority {
  name: string;
}
```

#### 1.5.5 User (Read-Only) Entity (`entities/user/`)

| File | Purpose |
|---|---|
| `service/user.service.ts` | `GET /api/users` (public user list for dropdowns) |
| `user.model.ts` | `{ id: number; login?: string }` |

---

### 1.6 Shared Module (`src/main/webapp/app/shared/`)

| Sub-module | Contents | Purpose |
|---|---|---|
| **alert** | `AlertComponent`, `AlertErrorComponent` | Flash notifications from HTTP response headers |
| **auth** | `HasAnyAuthorityDirective` | `*jhiHasAnyAuthority` structural directive for role-based UI |
| **date** | `DurationPipe`, `FormatMediumDatePipe`, `FormatMediumDatetimePipe` | Date formatting using Day.js |
| **filter** | `FilterComponent`, `FilterModel` | Reusable filter UI |
| **jhipster** | `constants.ts`, `data-utils.ts`, `error.constants.ts`, `headers.ts`, `problem-details.ts` | JHipster constants (`Authority` enum: `ROLE_ADMIN`, `ROLE_USER`), header names, error URIs |
| **language** | `TranslateDirective`, `FindLanguageFromKeyPipe`, `TranslationModule` | i18n support |
| **pagination** | `ItemCountComponent` | "Showing X of Y" display |
| **sort** | `SortDirective`, `SortByDirective`, `SortService`, `SortState` | Column sorting for tables |

---

### 1.7 Core Module (`src/main/webapp/app/core/`)

| Sub-module | Contents | Purpose |
|---|---|---|
| **auth** | `AccountService`, `AuthServerProvider`, `StateStorageService`, `UserRouteAccessService`, `Account` model | Authentication state, JWT token management, route guard |
| **config** | `ApplicationConfigService` | API endpoint prefix resolution |
| **interceptor** | `authInterceptor`, `authExpiredInterceptor`, `errorHandlerInterceptor`, `notificationInterceptor` | HTTP interceptor chain |
| **request** | `createRequestOption`, request models | Query parameter builder |
| **util** | `operators` (isPresent) | Utility functions |

---

### 1.8 Layouts Module (`src/main/webapp/app/layouts/`)

| Sub-module | Purpose |
|---|---|
| **main** | `MainComponent` - app shell |
| **navbar** | `NavbarComponent` - top navigation bar |
| **footer** | `FooterComponent` |
| **error** | `ErrorComponent` - 404/403/error pages |
| **profiles** | `PageRibbonComponent`, `ProfileService` - dev/prod ribbon indicator via `GET /management/info` |

---

### 1.9 Config (`src/main/webapp/app/config/`)

| File | Purpose |
|---|---|
| `datepicker-adapter.ts` | NgbDateAdapter using Day.js |
| `dayjs.ts` | Day.js plugin initialization |
| `font-awesome-icons.ts` | Icon library registration |
| `input.constants.ts` | Form input constants |
| `language.constants.ts` | Supported languages array |
| `navigation.constants.ts` | Navigation constants |
| `pagination.constants.ts` | `ITEMS_PER_PAGE` default |
| `translation.config.ts` | i18n configuration |
| `uib-pagination.config.ts` | NgBootstrap pagination config |

---

## 2. Spring Boot Backend Packages

Base package: `io.github.jhipster.sample`

### 2.1 Domain (`domain/`)

| Entity | Table | Key Fields | Relationships |
|---|---|---|---|
| `User` | `jhi_user` | id (Long), login, password (hashed), firstName, lastName, email, activated, langKey, imageUrl, activationKey, resetKey, resetDate | ManyToMany -> Authority |
| `Authority` | `jhi_authority` | name (String PK) | Referenced by User |
| `BankAccount` | `bank_account` | id (Long), name (String, required), balance (BigDecimal, required) | ManyToOne -> User; OneToMany -> Operation |
| `Operation` | `operation` | id (Long), date (Instant, required), description (String), amount (BigDecimal, required) | ManyToOne -> BankAccount; ManyToMany -> Label (join table: `rel_operation__label`) |
| `Label` | `label` | id (Long), label (String, required, min=3) | ManyToMany (mappedBy) -> Operation |
| `AbstractAuditingEntity` | (mapped superclass) | createdBy, createdDate, lastModifiedBy, lastModifiedDate | Base class for User |

### 2.2 Repository (`repository/`)

| Repository | Entity | Notable Methods |
|---|---|---|
| `UserRepository` | User | `findOneByLogin()`, `findOneByEmailIgnoreCase()`, `findOneByActivationKey()`, `findOneByResetKey()` |
| `AuthorityRepository` | Authority | Standard JPA |
| `BankAccountRepository` | BankAccount | `findAllWithEagerRelationships()`, `findOneWithEagerRelationships()` |
| `OperationRepository` | Operation | `findAllWithEagerRelationships(Pageable)`, `findOneWithEagerRelationships()` |
| `OperationRepositoryWithBagRelationships` | Operation | Custom interface for bag (ManyToMany) eager loading |
| `LabelRepository` | Label | Standard JPA |

### 2.3 Service (`service/`)

| Class | Purpose |
|---|---|
| `UserService` | User CRUD, registration, activation, password reset, scheduled cleanup |
| `MailService` | Email sending (activation, password reset, creation emails) |
| `EmailAlreadyUsedException` | Business exception |
| `InvalidPasswordException` | Business exception |
| `UsernameAlreadyUsedException` | Business exception |

#### Service DTOs (`service/dto/`)

| DTO | Fields | Usage |
|---|---|---|
| `AdminUserDTO` | id, login, firstName, lastName, email, imageUrl, activated, langKey, createdBy, createdDate, lastModifiedBy, lastModifiedDate, authorities (Set\<String\>) | Full user representation for admin endpoints and account info |
| `UserDTO` | id, login | Public user representation (minimal) |
| `PasswordChangeDTO` | currentPassword, newPassword | Password change request body |

#### Service Mapper (`service/mapper/`)

| Class | Purpose |
|---|---|
| `UserMapper` | Maps between `User` entity and `UserDTO`/`AdminUserDTO` |

### 2.4 Web (`web/`)

#### REST Controllers (`web/rest/`)

| Controller | Base Path | Purpose |
|---|---|---|
| `AuthenticateController` | `/api` | JWT authentication (login) |
| `AccountResource` | `/api` | Current user account management |
| `PublicUserResource` | `/api` | Public user listing |
| `UserResource` | `/api/admin` | Admin user management (ROLE_ADMIN required) |
| `AuthorityResource` | `/api/authorities` | Authority CRUD (ROLE_ADMIN required) |
| `BankAccountResource` | `/api/bank-accounts` | BankAccount CRUD (authenticated) |
| `LabelResource` | `/api/labels` | Label CRUD (authenticated) |
| `OperationResource` | `/api/operations` | Operation CRUD with pagination (authenticated) |

#### View Models (`web/rest/vm/`)

| VM | Fields | Used By |
|---|---|---|
| `LoginVM` | username, password, rememberMe | `AuthenticateController.authorize()` |
| `ManagedUserVM` | extends AdminUserDTO + password | `AccountResource.registerAccount()` |
| `KeyAndPasswordVM` | key, newPassword | `AccountResource.finishPasswordReset()` |

#### Error Handling (`web/rest/errors/`)

| Class | Purpose |
|---|---|
| `ExceptionTranslator` | Global `@ControllerAdvice` for RFC 7807 Problem Details |
| `BadRequestAlertException` | 400 with entity name and error key |
| `EmailAlreadyUsedException` | 400 for duplicate email |
| `LoginAlreadyUsedException` | 400 for duplicate login |
| `InvalidPasswordException` | 400 for invalid password |
| `FieldErrorVM` | Field-level validation error |
| `ErrorConstants` | Error type URIs |

#### Filter (`web/filter/`)

| Class | Purpose |
|---|---|
| `SpaWebFilter` | Forwards non-API, non-static requests to `index.html` for Angular routing |

### 2.5 Security (`security/`)

| Class | Purpose |
|---|---|
| `AuthoritiesConstants` | `ROLE_ADMIN`, `ROLE_USER`, `ROLE_ANONYMOUS` |
| `SecurityUtils` | Static helpers: `getCurrentUserLogin()`, `JWT_ALGORITHM`, `AUTHORITIES_CLAIM`, `USER_ID_CLAIM` |
| `DomainUserDetailsService` | Loads user from DB for Spring Security authentication |
| `SpringSecurityAuditorAware` | Provides current user for JPA auditing (`@CreatedBy`, `@LastModifiedBy`) |
| `UserNotActivatedException` | Thrown when inactive user attempts login |

### 2.6 Config (`config/`)

| Class | Purpose |
|---|---|
| `SecurityConfiguration` | Spring Security filter chain: CORS, CSRF disabled, stateless sessions, JWT resource server, URL authorization rules |
| `SecurityJwtConfiguration` | JWT encoder/decoder beans |
| `ApplicationProperties` | Custom app properties |
| `AsyncConfiguration` | Async executor configuration |
| `CacheConfiguration` | Ehcache configuration for Hibernate L2 cache |
| `CacheKeyGeneratorConfiguration` | Cache key generation |
| `Constants` | Login regex, system account name |
| `DatabaseConfiguration` | JPA/Hibernate configuration |
| `DateTimeFormatConfiguration` | Date/time format configuration |
| `JacksonConfiguration` | Jackson ObjectMapper customization |
| `JacksonHibernateConfiguration` | Hibernate5Module for lazy loading serialization |
| `LiquibaseConfiguration` | Database migration configuration |
| `LoggingAspectConfiguration` | Conditional AOP logging |
| `LoggingConfiguration` | Logback configuration |
| `StaticResourcesWebConfiguration` | Static resource serving |
| `WebConfigurer` | CORS filter, Servlet context |

### 2.7 AOP (`aop/logging/`)

| Class | Purpose |
|---|---|
| `LoggingAspect` | AOP aspect for method entry/exit/exception logging on `@Repository`, `@Service`, `@RestController` |

### 2.8 Management (`management/`)

| Class | Purpose |
|---|---|
| `SecurityMetersService` | Micrometer metrics for security events (auth success/failure) |

---

## 3. API Contracts

### 3.1 Authentication Endpoints

| Method | Endpoint | Request Body | Response | Angular Consumer |
|---|---|---|---|---|
| `POST` | `/api/authenticate` | `LoginVM { username, password, rememberMe }` | `{ id_token: string }` (JWT) | `AuthServerProvider.login()` -> `LoginComponent` |
| `GET` | `/api/authenticate` | - | `204 No Content` or `401 Unauthorized` | (Rarely used directly) |

### 3.2 Account Endpoints

| Method | Endpoint | Request Body | Response | Angular Consumer |
|---|---|---|---|---|
| `GET` | `/api/account` | - | `AdminUserDTO` | `AccountService.identity()` / `AccountService.fetch()` -> `Home`, `Settings`, `Navbar` |
| `POST` | `/api/account` | `AdminUserDTO` (partial) | `void` | `AccountService.save()` -> `Settings` |
| `POST` | `/api/register` | `ManagedUserVM { login, email, password, langKey, ... }` | `201 Created` | `RegisterService.save()` -> `RegisterComponent` |
| `GET` | `/api/activate?key=` | query param `key` | `void` | `ActivateService.get()` -> `ActivateComponent` |
| `POST` | `/api/account/change-password` | `PasswordChangeDTO { currentPassword, newPassword }` | `void` | `PasswordService.save()` -> `PasswordComponent` |
| `POST` | `/api/account/reset-password/init` | `string` (email) | `void` | `PasswordResetInitService.save()` -> `PasswordResetInitComponent` |
| `POST` | `/api/account/reset-password/finish` | `KeyAndPasswordVM { key, newPassword }` | `void` | `PasswordResetFinishService.save()` -> `PasswordResetFinishComponent` |

### 3.3 Admin User Management Endpoints (ROLE_ADMIN)

| Method | Endpoint | Request Body | Response | Angular Consumer |
|---|---|---|---|---|
| `GET` | `/api/admin/users` | Pageable params | `AdminUserDTO[]` + pagination headers | `UserManagementService.query()` -> `UserManagementListComponent` |
| `GET` | `/api/admin/users/{login}` | - | `AdminUserDTO` | `UserManagementService.find()` -> `UserManagementDetailComponent` |
| `POST` | `/api/admin/users` | `AdminUserDTO` | `User` entity | `UserManagementService.create()` -> `UserManagementUpdateComponent` |
| `PUT` | `/api/admin/users` | `AdminUserDTO` | `AdminUserDTO` | `UserManagementService.update()` -> `UserManagementUpdateComponent` |
| `DELETE` | `/api/admin/users/{login}` | - | `204 No Content` | `UserManagementService.delete()` -> `UserManagementDeleteComponent` |

### 3.4 Public User Endpoint

| Method | Endpoint | Request Body | Response | Angular Consumer |
|---|---|---|---|---|
| `GET` | `/api/users` | Pageable params | `UserDTO[]` (id, login only) + pagination headers | `UserService.query()` -> Used in BankAccount/Operation update forms for user dropdown |

### 3.5 Authority Endpoints (ROLE_ADMIN)

| Method | Endpoint | Request Body | Response | Angular Consumer |
|---|---|---|---|---|
| `GET` | `/api/authorities` | - | `Authority[]` | `AuthorityService.query()` -> `AuthorityListComponent`; `UserManagementService.authorities()` -> user-management update form |
| `GET` | `/api/authorities/{id}` | - | `Authority` | `AuthorityService.find()` -> `AuthorityDetailComponent` |
| `POST` | `/api/authorities` | `Authority { name }` | `Authority` | `AuthorityService.create()` -> `AuthorityUpdateComponent` |
| `DELETE` | `/api/authorities/{id}` | - | `204 No Content` | `AuthorityService.delete()` -> `AuthorityDeleteDialogComponent` |

### 3.6 BankAccount Endpoints (Authenticated)

| Method | Endpoint | Request Body | Response | Angular Consumer |
|---|---|---|---|---|
| `GET` | `/api/bank-accounts` | `?eagerload=true` | `BankAccount[]` | `BankAccountService.query()` -> `BankAccountListComponent` |
| `GET` | `/api/bank-accounts/{id}` | - | `BankAccount` | `BankAccountService.find()` -> `BankAccountDetailComponent` |
| `POST` | `/api/bank-accounts` | `BankAccount` (domain entity as JSON) | `BankAccount` (201 Created) | `BankAccountService.create()` -> `BankAccountUpdateComponent` |
| `PUT` | `/api/bank-accounts/{id}` | `BankAccount` | `BankAccount` | `BankAccountService.update()` -> `BankAccountUpdateComponent` |
| `PATCH` | `/api/bank-accounts/{id}` | Partial `BankAccount` | `BankAccount` | `BankAccountService.partialUpdate()` |
| `DELETE` | `/api/bank-accounts/{id}` | - | `204 No Content` | `BankAccountService.delete()` -> `BankAccountDeleteDialogComponent` |

**Note:** BankAccount endpoints use the domain entity directly (no DTO layer). The JSON shape is:
```json
{ "id": 1, "name": "Main Account", "balance": 1500.00, "user": { "id": 1, "login": "admin" } }
```

### 3.7 Label Endpoints (Authenticated)

| Method | Endpoint | Request Body | Response | Angular Consumer |
|---|---|---|---|---|
| `GET` | `/api/labels` | - | `Label[]` | `LabelService.query()` -> `LabelListComponent` |
| `GET` | `/api/labels/{id}` | - | `Label` | `LabelService.find()` -> `LabelDetailComponent` |
| `POST` | `/api/labels` | `Label` (domain entity) | `Label` (201 Created) | `LabelService.create()` -> `LabelUpdateComponent` |
| `PUT` | `/api/labels/{id}` | `Label` | `Label` | `LabelService.update()` -> `LabelUpdateComponent` |
| `PATCH` | `/api/labels/{id}` | Partial `Label` | `Label` | `LabelService.partialUpdate()` |
| `DELETE` | `/api/labels/{id}` | - | `204 No Content` | `LabelService.delete()` -> `LabelDeleteDialogComponent` |

**JSON shape:**
```json
{ "id": 1, "label": "urgent" }
```

### 3.8 Operation Endpoints (Authenticated, Paginated)

| Method | Endpoint | Request Body | Response | Angular Consumer |
|---|---|---|---|---|
| `GET` | `/api/operations` | Pageable + `?eagerload=true` | `Operation[]` + pagination headers | `OperationService.query()` -> `OperationListComponent` |
| `GET` | `/api/operations/{id}` | - | `Operation` | `OperationService.find()` -> `OperationDetailComponent` |
| `POST` | `/api/operations` | `Operation` (domain entity, date as ISO Instant) | `Operation` (201 Created) | `OperationService.create()` -> `OperationUpdateComponent` |
| `PUT` | `/api/operations/{id}` | `Operation` | `Operation` | `OperationService.update()` -> `OperationUpdateComponent` |
| `PATCH` | `/api/operations/{id}` | Partial `Operation` | `Operation` | `OperationService.partialUpdate()` |
| `DELETE` | `/api/operations/{id}` | - | `204 No Content` | `OperationService.delete()` -> `OperationDeleteDialogComponent` |

**JSON shape:**
```json
{
  "id": 1,
  "date": "2024-01-15T10:30:00Z",
  "description": "Payment",
  "amount": -50.00,
  "bankAccount": { "id": 1, "name": "Main Account", "balance": 1500.00 },
  "labels": [{ "id": 1, "label": "urgent" }]
}
```

**Note:** The Angular `OperationService` performs client-side date conversion: `dayjs.Dayjs` <-> ISO string.

### 3.9 Actuator / Management Endpoints

| Method | Endpoint | Angular Consumer | Auth |
|---|---|---|---|
| `GET` | `/management/info` | `ProfileService.getProfileInfo()` -> `NavbarComponent`, `PageRibbonComponent` | Public |
| `GET` | `/management/health` | Admin Health component | Public |
| `GET` | `/management/configprops` | Admin Configuration component | ROLE_ADMIN |
| `GET` | `/management/env` | Admin Configuration component | ROLE_ADMIN |
| `GET/PUT` | `/management/loggers` | Admin Logs component | ROLE_ADMIN |
| `GET` | `/management/jhi-metrics` | Admin Metrics component | ROLE_ADMIN |
| `GET` | `/management/threaddump` | Admin Metrics component | ROLE_ADMIN |

---

## 4. Shared Dependencies Between UI and Backend

### 4.1 Authentication / Authorization Flow

```
Angular LoginComponent
  -> LoginService.login({ username, password, rememberMe })
    -> AuthServerProvider.login()
      -> POST /api/authenticate (LoginVM)
      <- { id_token: "jwt..." }
      -> StateStorageService.storeAuthenticationToken(jwt, rememberMe)
         (localStorage if rememberMe, else sessionStorage)
    -> AccountService.identity(force=true)
      -> GET /api/account
      <- AdminUserDTO (mapped to Account model)
      -> AccountService.authenticate(account)

Subsequent API calls:
  -> authInterceptor adds "Authorization: Bearer <jwt>" header
  -> Backend validates JWT via Spring Security oauth2ResourceServer

Token expiry:
  -> authExpiredInterceptor detects 401
  -> Clears token, redirects to /login

Route guarding:
  -> UserRouteAccessService checks AccountService.identity()
  -> Compares route's "authorities" data with user's authorities
  -> Redirects to /login (unauthenticated) or /accessdenied (unauthorized)
```

**Shared Authority Constants:**

| Frontend (`shared/jhipster/constants.ts`) | Backend (`security/AuthoritiesConstants.java`) |
|---|---|
| `Authority.ADMIN = 'ROLE_ADMIN'` | `ADMIN = "ROLE_ADMIN"` |
| `Authority.USER = 'ROLE_USER'` | `USER = "ROLE_USER"` |
| - | `ANONYMOUS = "ROLE_ANONYMOUS"` |

### 4.2 Security Configuration Contract

**Backend URL authorization rules (`SecurityConfiguration.java`):**

| URL Pattern | Access |
|---|---|
| `/api/authenticate` (GET, POST) | Public |
| `/api/register` | Public |
| `/api/activate` | Public |
| `/api/account/reset-password/init` | Public |
| `/api/account/reset-password/finish` | Public |
| `/api/admin/**` | ROLE_ADMIN |
| `/api/**` | Authenticated |
| `/management/health`, `/management/info`, `/management/prometheus` | Public |
| `/management/**` | ROLE_ADMIN |
| Static resources (`*.js`, `*.css`, `/app/**`, `/content/**`, `/i18n/**`) | Public |

### 4.3 DTO / Model Alignment

| Backend DTO/Entity | Angular Model | Shared Context |
|---|---|---|
| `LoginVM` (vm) | `Login` (login.model.ts) | `POST /api/authenticate` request body |
| `JWTToken` (inner class) | `JwtToken` type in `auth-jwt.service.ts` | `POST /api/authenticate` response `{ id_token }` |
| `AdminUserDTO` | `Account` (core/auth/account.model.ts) | `GET/POST /api/account` |
| `AdminUserDTO` | `IUser` (admin/user-management/user-management.model.ts) | `GET/POST/PUT /api/admin/users` |
| `UserDTO` (id, login) | `IUser` (entities/user/user.model.ts) | `GET /api/users` |
| `ManagedUserVM` (extends AdminUserDTO + password) | `Registration` (account/register/register.model.ts) | `POST /api/register` |
| `PasswordChangeDTO` | Inline `{ currentPassword, newPassword }` | `POST /api/account/change-password` |
| `KeyAndPasswordVM` | Inline `{ key, newPassword }` | `POST /api/account/reset-password/finish` |
| `BankAccount` (domain entity) | `IBankAccount` (entities/bank-account/bank-account.model.ts) | All `/api/bank-accounts` endpoints |
| `Label` (domain entity) | `ILabel` (entities/label/label.model.ts) | All `/api/labels` endpoints |
| `Operation` (domain entity) | `IOperation` (entities/operation/operation.model.ts) | All `/api/operations` endpoints |
| `Authority` (domain entity) | `IAuthority` (entities/admin/authority/authority.model.ts) | All `/api/authorities` endpoints |

### 4.4 API Endpoint Configuration

**Backend:** Endpoints are defined via `@RequestMapping` annotations on REST controllers. The base server URL is determined by `application.yml` (`server.port`, context path).

**Frontend:** `ApplicationConfigService.getEndpointFor(api)` builds the full URL. The prefix is empty by default (same-origin), meaning the Angular app and Spring Boot backend are served from the same host:port. The `SpaWebFilter` on the backend forwards non-API requests to `index.html`.

### 4.5 Error Handling Contract

**Backend -> Frontend error flow:**

1. Backend throws exceptions (e.g., `BadRequestAlertException`, `EmailAlreadyUsedException`)
2. `ExceptionTranslator` (`@ControllerAdvice`) converts to RFC 7807 Problem Details JSON
3. Custom headers: `X-jhipsterSampleApplicationApp-alert`, `X-jhipsterSampleApplicationApp-error`, `X-jhipsterSampleApplicationApp-params`
4. Frontend `errorHandlerInterceptor` catches non-401 errors
5. Frontend `notificationInterceptor` reads success alert headers for flash messages
6. `AlertErrorComponent` displays error details from the Problem Details response

### 4.6 Pagination Contract

**Backend:** Uses Spring Data `Pageable` with `PaginationUtil.generatePaginationHttpHeaders()` to set `Link`, `X-Total-Count` headers.

**Frontend:** Entity services pass `{ page, size, sort }` query parameters via `createRequestOption()`. The `ItemCountComponent` and pagination controls use response headers to display totals.

**Paginated endpoints:** `GET /api/operations`, `GET /api/admin/users`, `GET /api/users`

### 4.7 Internationalization (i18n)

**Backend:** User's `langKey` field stored in DB. Mail templates use locale.

**Frontend:** `@ngx-translate/core` with JSON translation files under `src/main/webapp/i18n/{lang}/`. Languages defined in `language.constants.ts`. The `langKey` from `GET /api/account` response controls the active locale.

### 4.8 Entity Relationship Diagram

```
User (jhi_user)
  |
  +-- ManyToMany --> Authority (jhi_authority)
  |                    via jhi_user_authority
  |
  +-- OneToMany <-- BankAccount (bank_account)
                      |
                      +-- OneToMany <-- Operation (operation)
                                          |
                                          +-- ManyToMany --> Label (label)
                                               via rel_operation__label
```

---

## 5. Migration Considerations

### 5.1 Frontend-Backend Decoupling Points

1. **API Contract Surface:** All communication is via REST JSON over HTTP. No server-side rendering or template coupling.
2. **Same-origin assumption:** The `SpaWebFilter` and empty `endpointPrefix` assume frontend and backend are co-located. Migration to separate deployments requires:
   - Setting `ApplicationConfigService.endpointPrefix` to the backend URL
   - Configuring CORS on the backend for the frontend's origin
3. **JWT is self-contained:** Token validation doesn't require session state. Frontend stores JWT in localStorage/sessionStorage.

### 5.2 Components That Can Be Independently Migrated

| Component | Dependencies | Migration Notes |
|---|---|---|
| BankAccount CRUD | User entity (FK), Operation (inverse FK) | Can extract as microservice with own DB; needs user ID resolution |
| Label CRUD | Operation (ManyToMany) | Simple entity, could be part of Operation service |
| Operation CRUD | BankAccount (FK), Label (M2M) | Core business entity; paginated |
| User Management | Authority, MailService | Core identity service; tightly coupled to auth |
| Auth (JWT) | User, Authority | Should remain centralized or become an auth service |

### 5.3 Shared Libraries / Frameworks

| Layer | Key Dependencies |
|---|---|
| **Backend** | Spring Boot 3.x, Spring Security (JWT/OAuth2 Resource Server), Spring Data JPA, Hibernate, Liquibase, JHipster Framework (`tech.jhipster`), Jackson |
| **Frontend** | Angular 19.x (standalone components), NgBootstrap, @ngx-translate, Day.js, RxJS |
| **Build** | Maven (parent: spring-boot-starter-parent), npm, webpack |
| **Testing** | JUnit 5, Spring Boot Test, Vitest (frontend), Cypress (e2e) |
