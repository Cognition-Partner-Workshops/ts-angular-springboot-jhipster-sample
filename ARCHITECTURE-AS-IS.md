# Architecture-As-Is: JHipster Sample Application

## Overview

This is a JHipster monolith application combining an Angular frontend with a Spring Boot backend, packaged as a single deployable unit. The application uses Maven for build management and Liquibase for database migrations.

---

## Technology Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Frontend   | Angular 19, TypeScript, Bootstrap       |
| Backend    | Spring Boot 3.x, Java 21                |
| ORM        | Hibernate / JPA                         |
| Database   | H2 (dev), PostgreSQL (prod)             |
| Migrations | Liquibase                               |
| Auth       | JWT (Spring Security)                   |
| Build      | Maven (backend), npm/webpack (frontend) |
| Cache      | Ehcache                                 |

---

## Entities

| Entity      | Table Name    | Fields                                                                  | Relationships                                 |
| ----------- | ------------- | ----------------------------------------------------------------------- | --------------------------------------------- |
| User        | jhi_user      | id, login, password_hash, first_name, last_name, email, activated, etc. | ManyToMany -> Authority                       |
| Authority   | jhi_authority | name                                                                    | ManyToMany -> User                            |
| BankAccount | bank_account  | id, name, balance (BigDecimal)                                          | ManyToOne -> User; OneToMany -> Operation     |
| Operation   | operation     | id, date (Instant), description, amount (BigDecimal)                    | ManyToOne -> BankAccount; ManyToMany -> Label |
| Label       | label         | id, label (String, min=3)                                               | ManyToMany -> Operation                       |

---

## REST Endpoints

### Account & Authentication

| Method | Path                           | Description                  |
| ------ | ------------------------------ | ---------------------------- |
| POST   | /api/authenticate              | Login (JWT)                  |
| GET    | /api/account                   | Get current user account     |
| POST   | /api/account                   | Save current user account    |
| POST   | /api/account/change-password   | Change password              |
| POST   | /api/account/reset-password/\* | Reset password (init/finish) |
| POST   | /api/register                  | Register new user            |
| GET    | /api/activate                  | Activate account             |

### User Management (Admin)

| Method | Path                    | Description            |
| ------ | ----------------------- | ---------------------- |
| GET    | /api/admin/users        | List users (paginated) |
| POST   | /api/admin/users        | Create user            |
| PUT    | /api/admin/users        | Update user            |
| GET    | /api/admin/users/:login | Get user by login      |
| DELETE | /api/admin/users/:login | Delete user            |
| GET    | /api/users              | Public user list       |
| GET    | /api/authorities        | List authorities       |

### BankAccount

| Method | Path                   | Description                 |
| ------ | ---------------------- | --------------------------- |
| GET    | /api/bank-accounts     | List all bank accounts      |
| POST   | /api/bank-accounts     | Create bank account         |
| PUT    | /api/bank-accounts/:id | Update bank account         |
| PATCH  | /api/bank-accounts/:id | Partial update bank account |
| GET    | /api/bank-accounts/:id | Get bank account by ID      |
| DELETE | /api/bank-accounts/:id | Delete bank account         |

### Operation

| Method | Path                | Description                 |
| ------ | ------------------- | --------------------------- |
| GET    | /api/operations     | List operations (paginated) |
| POST   | /api/operations     | Create operation            |
| PUT    | /api/operations/:id | Update operation            |
| PATCH  | /api/operations/:id | Partial update operation    |
| GET    | /api/operations/:id | Get operation by ID         |
| DELETE | /api/operations/:id | Delete operation            |

### Label

| Method | Path            | Description          |
| ------ | --------------- | -------------------- |
| GET    | /api/labels     | List all labels      |
| POST   | /api/labels     | Create label         |
| PUT    | /api/labels/:id | Update label         |
| PATCH  | /api/labels/:id | Partial update label |
| GET    | /api/labels/:id | Get label by ID      |
| DELETE | /api/labels/:id | Delete label         |

---

## Angular Routes

| Route                      | Component          | Description             |
| -------------------------- | ------------------ | ----------------------- |
| /                          | Home               | Home page               |
| /login                     | Login              | Login form              |
| /account/register          | Register           | Registration            |
| /account/settings          | Settings           | User settings           |
| /account/password          | Password           | Change password         |
| /account/password/reset/\* | PasswordReset      | Reset password          |
| /bank-account              | BankAccount (list) | List bank accounts      |
| /bank-account/new          | BankAccountUpdate  | Create bank account     |
| /bank-account/:id/view     | BankAccountDetail  | View bank account       |
| /bank-account/:id/edit     | BankAccountUpdate  | Edit bank account       |
| /label                     | Label (list)       | List labels             |
| /label/new                 | LabelUpdate        | Create label            |
| /label/:id/view            | LabelDetail        | View label              |
| /label/:id/edit            | LabelUpdate        | Edit label              |
| /operation                 | Operation (list)   | List operations         |
| /operation/new             | OperationUpdate    | Create operation        |
| /operation/:id/view        | OperationDetail    | View operation          |
| /operation/:id/edit        | OperationUpdate    | Edit operation          |
| /authority                 | Authority (list)   | Admin: List authorities |
| /admin/user-management     | UserManagement     | Admin: Manage users     |
| /admin/metrics             | Metrics            | Admin: JVM metrics      |
| /admin/health              | Health             | Admin: Health checks    |
| /admin/configuration       | Configuration      | Admin: Config props     |
| /admin/logs                | Logs               | Admin: Log levels       |
| /admin/docs                | Docs               | Admin: API docs         |

---

## Data Source Configuration

### Development (application-dev.yml)

- **Type**: H2 in-memory database
- **JDBC URL**: `jdbc:h2:mem:jhipsterSampleApplication;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE`
- **Username**: jhipsterSampleApplication
- **H2 Console**: Enabled
- **Liquibase contexts**: dev, faker

### Production (application-prod.yml)

- **Type**: PostgreSQL
- **JDBC URL**: `jdbc:postgresql://localhost:5432/jhipsterSampleApplication`
- **Username**: jhipsterSampleApplication
- **Liquibase contexts**: prod

### Common (application.yml)

- **ORM**: Hibernate with `ddl-auto: none` (Liquibase manages schema)
- **Cache**: Ehcache (second-level cache enabled)
- **Connection pool**: HikariCP

---

## Monolith Structure Summary

```
src/
├── main/
│   ├── java/io/github/jhipster/sample/
│   │   ├── domain/          # JPA entities (BankAccount, Operation, Label, User, Authority)
│   │   ├── repository/      # Spring Data JPA repositories
│   │   ├── web/rest/        # REST controllers
│   │   ├── service/         # Service layer (UserService, MailService)
│   │   ├── security/        # JWT security, user details
│   │   ├── config/          # Spring configuration classes
│   │   └── aop/             # AOP logging
│   ├── resources/
│   │   ├── config/
│   │   │   ├── application.yml       # Common config
│   │   │   ├── application-dev.yml   # Dev profile (H2)
│   │   │   ├── application-prod.yml  # Prod profile (PostgreSQL)
│   │   │   └── liquibase/            # Database migrations
│   │   └── i18n/                     # Internationalization
│   └── webapp/
│       └── app/
│           ├── entities/     # Entity components (bank-account, operation, label)
│           ├── layouts/      # Navbar, footer, main layout
│           ├── shared/       # Shared components, directives, pipes
│           ├── core/         # Auth, interceptors, config
│           ├── login/        # Login page
│           ├── home/         # Home page
│           └── account/      # Account management
└── test/                     # Java integration tests, Angular unit tests
```

---

## Key Observations for Modernization

1. **Tight coupling**: Frontend and backend are packaged together; Angular is served by Spring Boot.
2. **Database migration path**: Dev uses H2 in-memory; prod already targets PostgreSQL.
3. **No service layer for entities**: BankAccount and Operation resources directly use repositories (no intermediate service).
4. **Liquibase managed schema**: All schema changes must go through Liquibase changelogs.
5. **JHipster needle comments**: The codebase uses JHipster needle comments for code generation insertion points.
