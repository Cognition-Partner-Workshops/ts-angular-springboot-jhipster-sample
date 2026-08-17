# Locked API contract — `GET /api/account-summary` (DJ-92)

Single source of truth for the Account Overview dashboard. Copied verbatim from Jira DJ-92;
neither the backend nor the frontend workstream may change it.

## Endpoint

`GET /api/account-summary`

- Auth: authenticated user required (same security config style as `BankAccountResource`).
  Anonymous requests get `401`; in the SPA anonymous users are redirected to login.
- Success: `200 OK`, `Content-Type: application/json`
- Read-only aggregation; no request parameters.

## Response body

```json
{
  "totalBalance": 12345.67,
  "accountCount": 3,
  "operationCount": 42,
  "accounts": [
    { "id": 1, "name": "Current account", "balance": 4200.00, "operationCount": 17 }
  ],
  "recentOperations": [
    { "id": 9, "date": "2026-08-01T10:15:30Z", "description": "Groceries", "amount": -54.20, "bankAccountName": "Current account" }
  ]
}
```

## Field reference

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| `totalBalance` | number (`BigDecimal`, scale 2) | no | Sum of all bank account balances |
| `accountCount` | integer (`long`) | no | Total number of bank accounts |
| `operationCount` | integer (`long`) | no | Total number of operations (all accounts) |
| `accounts` | array | no (may be empty, never `null`) | One entry per bank account |
| `accounts[].id` | integer (`Long`) | no | Bank account id |
| `accounts[].name` | string | no | Bank account name |
| `accounts[].balance` | number (`BigDecimal`, scale 2) | no | Account balance |
| `accounts[].operationCount` | integer (`long`) | no | Operations belonging to that account |
| `recentOperations` | array | no (may be empty, never `null`) | 10 most recent operations |
| `recentOperations[].id` | integer (`Long`) | no | Operation id |
| `recentOperations[].date` | string, ISO-8601 UTC instant (`Instant`) | no | e.g. `2026-08-01T10:15:30Z` |
| `recentOperations[].description` | string | yes | Operation description as stored |
| `recentOperations[].amount` | number (`BigDecimal`, scale 2) | no | Signed amount |
| `recentOperations[].bankAccountName` | string | yes | Owning account name (`null` if operation has no account) |

## Rules

- `recentOperations` = the 10 most recent `Operation` rows by `date` descending, across all accounts.
- Monetary values are JSON numbers with 2 decimals (`BigDecimal`, scale 2).
- Empty database returns `totalBalance: 0`, `accountCount: 0`, `operationCount: 0` and empty
  arrays — never `null`.
- Aggregation is done in JPQL `@Query` methods on `BankAccountRepository` / `OperationRepository`
  (no N+1 query per account).
