# JHipster Monolith Separation Plan

## Overview

This document details the plan to split the JHipster monolith (`ts-angular-springboot-jhipster-sample`) into two standalone applications:

1. **Standalone Angular Frontend** - served independently (e.g., via nginx or a CDN)
2. **Spring Boot Microservice Backend** - a new module in `app_petclinic-microservices` following its existing service patterns

---

## Part 1: Standalone Angular Frontend Changes

### 1.1 Base URL Configuration

**Current state:** `ApplicationConfigService` uses an empty `endpointPrefix`, meaning all API calls go to the same origin (co-located backend).

**Required changes:**

| File | Change |
|---|---|
| `app/core/config/application-config.service.ts` | Set `endpointPrefix` to the remote backend URL (e.g., `http://localhost:8085` for dev, or the production URL). Ideally load from `environment.ts` or a runtime config file. |
| `environment.ts` / `environment.prod.ts` | Add `apiBaseUrl` property pointing to the backend service URL. |
| `app.config.ts` (or `main.ts`) | On bootstrap, call `applicationConfigService.setEndpointPrefix(environment.apiBaseUrl)`. |

**Example:**
```typescript
// environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8085'
};

// environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://jhipster-backend.example.com'
};

// In app initialization:
applicationConfigService.setEndpointPrefix(environment.apiBaseUrl);
```

### 1.2 CORS Handling

**Current state:** Same-origin; no CORS issues. `SpaWebFilter` forwards non-API requests to `index.html`.

**Required changes:**
- The Angular app itself needs no CORS changes (browser handles preflight automatically).
- The **backend** must be configured to accept requests from the frontend's origin (see Part 2).
- Remove any assumptions about same-origin in interceptors or services.

### 1.3 Auth Token Handling

**Current state:** `authInterceptor` adds `Authorization: Bearer <token>` to all requests. `authExpiredInterceptor` handles 401 responses.

**Required changes:**

| Component | Change |
|---|---|
| `auth.interceptor.ts` | Ensure the interceptor only adds the token to requests going to the backend API (filter by URL prefix). This prevents leaking tokens to third-party requests. |
| `state-storage.service.ts` | No changes needed - token storage in localStorage/sessionStorage works independently. |
| `auth-expired.interceptor.ts` | No changes needed - 401 handling works the same. |

**Example interceptor filter:**
```typescript
// auth.interceptor.ts - add URL filtering
const apiUrl = inject(ApplicationConfigService).getEndpointFor('');
if (!req.url.startsWith(apiUrl)) {
  return next(req); // skip non-API requests
}
```

### 1.4 SPA Serving

**Current state:** Spring Boot's `SpaWebFilter` serves `index.html` for all non-API routes.

**Required changes:**
- Deploy Angular build output (`dist/`) via nginx, Apache, or a CDN.
- Configure the web server to redirect all non-file routes to `index.html` (SPA fallback).

**Nginx example:**
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 1.5 Profile / Management Endpoints

**Current state:** `ProfileService` calls `/management/info` to show a dev/prod ribbon.

**Required changes:**
- Either proxy `/management/info` from the backend or make the frontend configuration-driven (set profile in `environment.ts`).
- Admin pages (health, metrics, logs, configuration) will need the backend management endpoint URL configured.

### 1.6 Files to Remove from Frontend Build

The following backend-related files are no longer needed in a standalone frontend:
- `src/main/webapp/app/layouts/profiles/profile.service.ts` (or update to use remote URL)
- Any webpack proxy configuration for the backend (if present)

---

## Part 2: Spring Boot Microservice Backend

### 2.1 Code to Extract (Keep)

| Package/Class | Reason |
|---|---|
| **`domain/`** - `BankAccount`, `Label`, `Operation`, `User`, `Authority`, `AbstractAuditingEntity` | Core domain entities |
| **`repository/`** - All repositories | Data access layer |
| **`service/`** - `UserService`, `MailService`, DTOs, Mapper, exceptions | Business logic |
| **`web/rest/`** - `AccountResource`, `AuthenticateController`, `BankAccountResource`, `LabelResource`, `OperationResource`, `UserResource`, `PublicUserResource`, `AuthorityResource` | REST API controllers |
| **`web/rest/errors/`** - All error handling classes | Error translation |
| **`web/rest/vm/`** - `LoginVM`, `ManagedUserVM`, `KeyAndPasswordVM` | View models |
| **`security/`** - All security classes | Authentication/authorization |
| **`config/`** - `SecurityConfiguration`, `SecurityJwtConfiguration`, `DatabaseConfiguration`, `JacksonConfiguration`, `AsyncConfiguration`, `CacheConfiguration`, `Constants`, `ApplicationProperties` | Core configuration |
| **`aop/logging/`** - `LoggingAspect` | Cross-cutting logging |
| **`management/`** - `SecurityMetersService` | Metrics |

### 2.2 Monolith-Specific Code to Remove (Do NOT Extract)

| Class/Config | Reason to Remove |
|---|---|
| `SpaWebFilter` | Only needed when serving Angular from Spring Boot; not needed in API-only microservice |
| `StaticResourcesWebConfiguration` | Serves static frontend assets; not needed |
| `WebConfigurer` (Angular-related parts) | The servlet context customizer for Angular; only keep CORS filter setup |
| Frontend build integration (Maven frontend-maven-plugin) | Angular is now a separate project |
| `src/main/webapp/` | Entire Angular source tree; separate repo/project |
| `src/main/resources/static/` | Built Angular artifacts; not needed |
| Liquibase migrations | Will be adapted for the microservice's own database |
| `application.yml` Angular-related configs | e.g., `jhipster.clientApp.name` can remain for header utils |

### 2.3 New Configuration Required

| Configuration | Details |
|---|---|
| **CORS** | Must allow the Angular frontend's origin. Add `@CrossOrigin` or global CORS config allowing `http://localhost:4200` (dev) and production frontend URL. |
| **Server Port** | Assign a unique port (e.g., `8085`) that doesn't conflict with other petclinic services. |
| **Spring Cloud Integration** | Add `spring-cloud-starter-config` and `spring-cloud-starter-netflix-eureka-client` to register with the petclinic infrastructure. |
| **Database** | Use HSQLDB (in-memory, matching petclinic pattern) with option for MySQL. Include schema initialization via `data.sql` or Liquibase. |
| **JWT Configuration** | Self-contained JWT validation. The `SecurityJwtConfiguration` provides encoder/decoder beans. Configure the JWT secret in application properties. |

### 2.4 Microservice Module Structure (Following Petclinic Patterns)

```
spring-petclinic-jhipster-service/
├── pom.xml                          # Parent: spring-petclinic-microservices
├── src/main/java/org/springframework/samples/petclinic/jhipster/
│   ├── JhipsterServiceApplication.java
│   ├── config/
│   │   ├── MetricConfig.java        # Following petclinic pattern
│   │   ├── SecurityConfiguration.java
│   │   └── SecurityJwtConfiguration.java
│   ├── model/                       # Domain entities (petclinic uses 'model')
│   │   ├── Authority.java
│   │   ├── BankAccount.java
│   │   ├── Label.java
│   │   ├── Operation.java
│   │   ├── User.java
│   │   ├── AbstractAuditingEntity.java
│   │   ├── BankAccountRepository.java
│   │   ├── LabelRepository.java
│   │   ├── OperationRepository.java
│   │   ├── OperationRepositoryWithBagRelationships.java
│   │   ├── OperationRepositoryWithBagRelationshipsImpl.java
│   │   ├── UserRepository.java
│   │   └── AuthorityRepository.java
│   ├── service/
│   │   ├── UserService.java
│   │   └── dto/
│   │       ├── AdminUserDTO.java
│   │       └── UserDTO.java
│   ├── web/
│   │   ├── AuthenticateController.java
│   │   ├── AccountResource.java
│   │   ├── BankAccountResource.java
│   │   ├── LabelResource.java
│   │   ├── OperationResource.java
│   │   ├── UserResource.java
│   │   ├── PublicUserResource.java
│   │   ├── AuthorityResource.java
│   │   └── ResourceNotFoundException.java  # Following petclinic pattern
│   └── security/
│       ├── AuthoritiesConstants.java
│       └── SecurityUtils.java
├── src/main/resources/
│   ├── application.yml
│   └── data.sql                     # Initial schema + seed data
└── src/test/java/...
```

### 2.5 Key Adaptations for Petclinic Ecosystem

| Aspect | Monolith Approach | Microservice Approach |
|---|---|---|
| **Package naming** | `io.github.jhipster.sample` | `org.springframework.samples.petclinic.jhipster` |
| **Package structure** | `domain/`, `repository/`, `web/rest/` | `model/`, `web/` (repositories in model package) |
| **Controller naming** | `*Resource` | `*Resource` (same - petclinic also uses this) |
| **JHipster utils** | `tech.jhipster.web.util.HeaderUtil`, `PaginationUtil`, `ResponseUtil` | Inline/replace with standard Spring utilities |
| **Service discovery** | None (monolith) | Eureka client registration |
| **Config management** | Local `application.yml` | Spring Cloud Config Server |
| **Request DTOs** | Domain entities used directly | Java records for request DTOs (petclinic pattern) |
| **Metrics** | JHipster metrics | Micrometer `@Timed` annotations |
| **Error handling** | JHipster `ExceptionTranslator` | `@ResponseStatus` on exceptions (petclinic pattern) |

---

## Part 3: Migration Execution Sequence

1. **Create the microservice module** in `app_petclinic-microservices`
2. **Port domain entities** to the new package structure
3. **Port repositories** into the model package
4. **Port REST controllers** adapting to petclinic conventions
5. **Add security configuration** with JWT support and CORS
6. **Add Spring Cloud integration** (Eureka, Config Server)
7. **Configure database** with HSQLDB and initial schema
8. **Add to parent POM** as a new module
9. **Add to docker-compose.yml** for local development
10. **Update Angular frontend** to point to remote backend URL

---

## Part 4: API Contract Preservation

All existing API endpoints must be preserved exactly to ensure the Angular frontend continues to work without endpoint changes:

| Endpoint Group | Path | Must Preserve |
|---|---|---|
| Authentication | `POST /api/authenticate` | Request/response format identical |
| Account | `GET/POST /api/account`, `POST /api/register`, etc. | All account endpoints |
| Admin Users | `GET/POST/PUT/DELETE /api/admin/users` | Pagination headers |
| Public Users | `GET /api/users` | Response format |
| Authorities | `GET/POST/DELETE /api/authorities` | CRUD operations |
| Bank Accounts | `GET/POST/PUT/PATCH/DELETE /api/bank-accounts` | Including eager loading |
| Labels | `GET/POST/PUT/PATCH/DELETE /api/labels` | CRUD operations |
| Operations | `GET/POST/PUT/PATCH/DELETE /api/operations` | Pagination headers, eager loading |
