# Observability Runbook

This runbook covers health checks, dashboard links, alert playbooks, and common operational procedures for the JHipster Sample Application.

---

## Table of Contents

- [Health Checks](#health-checks)
- [Dashboard Links](#dashboard-links)
- [Alert Playbooks](#alert-playbooks)
  - [High Error Rate](#high-error-rate)
  - [High Latency](#high-latency)
  - [Low Total Balance](#low-total-balance)
  - [Hikari Pool Exhaustion](#hikari-pool-exhaustion)
  - [Application Down](#application-down)
- [Common Operations](#common-operations)

---

## Health Checks

### Endpoints

| Endpoint                              | Description                          | Auth Required |
|---------------------------------------|--------------------------------------|---------------|
| `GET /management/health`              | Overall health status                | No            |
| `GET /management/health/liveness`     | Kubernetes liveness probe            | No            |
| `GET /management/health/readiness`    | Kubernetes readiness probe (incl DB) | No            |
| `GET /management/health/db`           | Database connectivity                | ROLE_ADMIN    |
| `GET /management/prometheus`          | Prometheus metrics scrape endpoint   | No            |
| `GET /management/info`                | Application info and git metadata    | No            |

### Quick Health Check

```bash
# Basic health
curl -s http://localhost:8080/management/health | jq .

# Liveness (for K8s)
curl -s http://localhost:8080/management/health/liveness | jq .

# Readiness (for K8s)
curl -s http://localhost:8080/management/health/readiness | jq .

# Prometheus metrics
curl -s http://localhost:8080/management/prometheus | head -50
```

### Expected Healthy Response

```json
{
  "status": "UP",
  "groups": ["liveness", "readiness"]
}
```

---

## Dashboard Links

All dashboards are auto-provisioned when the monitoring stack is started via Docker Compose.

| Dashboard                        | URL                                          | Description                                               |
|----------------------------------|----------------------------------------------|-----------------------------------------------------------|
| **Application Overview**         | http://localhost:3000/d/app-overview          | Request rate, error rate, P50/P95/P99 latency             |
| **Business Metrics**             | http://localhost:3000/d/business-metrics      | Operation volume, account creation rate, total balance     |
| **JVM Enhanced (Hikari/Ehcache)**| http://localhost:3000/d/jvm-enhanced          | HikariCP pool stats, Ehcache hit/miss ratios              |
| **JVM (Micrometer)**             | http://localhost:3000/d/Ud1CFe3iz             | Standard JVM metrics (heap, threads, GC, CPU)             |
| **Prometheus UI**                | http://localhost:9090                         | Raw PromQL queries and alert status                       |

### Starting the Monitoring Stack

```bash
docker compose -f src/main/docker/monitoring.yml up -d
```

Default Grafana credentials: `admin` / `admin`

---

## Alert Playbooks

### High Error Rate

**Alert:** `HighErrorRate`
**Severity:** Critical
**Condition:** >5% of HTTP requests returning 5xx over 5 minutes

**Investigation Steps:**

1. Open the **Application Overview** dashboard and check the "Error Rate (5xx)" panel to identify which endpoints are failing.
2. Check application logs for stack traces:
   ```bash
   # If using structured JSON logging (prod)
   docker logs <container> 2>&1 | jq 'select(.level == "ERROR")'

   # If using plain text logging (dev)
   docker logs <container> 2>&1 | grep ERROR
   ```
3. Check if the database is healthy:
   ```bash
   curl -s http://localhost:8080/management/health | jq '.components.db'
   ```
4. Check HikariCP connection pool for exhaustion (see [Hikari Pool Exhaustion](#hikari-pool-exhaustion)).
5. Review recent deployments or configuration changes.

**Resolution:**
- If database-related: verify DB connectivity, check for long-running queries, increase pool size.
- If application-related: roll back recent deployment or apply hotfix.
- If external dependency: check downstream service health and circuit breaker status.

---

### High Latency

**Alert:** `HighLatency`
**Severity:** Warning
**Condition:** P95 response time >1s over 5 minutes

**Investigation Steps:**

1. Open the **Application Overview** dashboard and check the "Response Latency" panel.
2. Identify slow endpoints by examining per-URI metrics in Prometheus:
   ```promql
   histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket{application="jhipsterSampleApplication"}[5m])) by (le, uri))
   ```
3. Check if the issue correlates with increased traffic (check request rate panel).
4. Review HikariCP connection acquisition time in the **JVM Enhanced** dashboard.
5. Check GC activity in the **JVM (Micrometer)** dashboard for GC pressure.
6. If tracing is enabled, check distributed traces for the slow endpoints via the OTLP collector.

**Resolution:**
- If database-related: optimize queries, add indexes, increase pool size.
- If GC-related: tune heap size or GC parameters.
- If traffic spike: consider scaling or adding caching.

---

### Low Total Balance

**Alert:** `LowTotalBalance`
**Severity:** Warning
**Condition:** Total balance across all accounts < 100 for 10 minutes

**Investigation Steps:**

1. Open the **Business Metrics** dashboard and check "Total Balance" stat panel.
2. Check recent operations for large withdrawals:
   ```promql
   business_operations_amount_currency{quantile="0.99"}
   ```
3. Query the database for accounts with negative or zero balances.
4. Review the operations log for anomalous patterns.

**Resolution:**
- This may be a business-logic alert. Escalate to the business team if unexpected.
- Verify no unauthorized transactions occurred.
- Check for bugs in the balance calculation logic.

---

### Hikari Pool Exhaustion

**Alert:** `HikariPoolExhaustion` / `HikariConnectionTimeouts`
**Severity:** Critical
**Condition:** Pending threads > 0 for 5 minutes OR connection timeouts occurring

**Investigation Steps:**

1. Open the **JVM Enhanced** dashboard and check:
   - "HikariCP Active vs Idle Connections" — are all connections active with none idle?
   - "HikariCP Pending Threads" — how many threads are waiting?
   - "HikariCP Connection Acquisition Time" — is acquisition time spiking?
2. Check for long-running transactions or connection leaks:
   ```bash
   # Check thread dump for blocked threads
   curl -s http://localhost:8080/management/threaddump | jq '.threads[] | select(.threadState == "WAITING" or .threadState == "TIMED_WAITING") | .threadName'
   ```
3. Check database side for active sessions and locks.
4. Review `application-prod.yml` for pool configuration:
   - `spring.datasource.hikari.maximum-pool-size` (default: 10)
   - `spring.datasource.hikari.connection-timeout` (default: 30s)

**Resolution:**
- **Immediate:** Restart the application to release stuck connections.
- **Short-term:** Increase `maximum-pool-size` in configuration.
- **Long-term:** Fix connection leaks, optimize long-running queries, add `@Transactional(timeout=...)`.

---

### Application Down

**Alert:** `ApplicationDown`
**Severity:** Critical
**Condition:** Prometheus scrape target is unreachable for 1 minute

**Investigation Steps:**

1. Check if the application process is running:
   ```bash
   docker ps | grep jhipster
   # or
   ps aux | grep java
   ```
2. Check application logs for fatal errors:
   ```bash
   docker logs <container> --tail 100
   ```
3. Check system resources (disk, memory, CPU).
4. Verify network connectivity and DNS resolution.
5. Check if Liquibase migrations are blocking startup.

**Resolution:**
- Restart the application.
- If OOM: increase memory limits and review for memory leaks.
- If disk full: clear logs/temp files and add disk monitoring.
- If migration failure: fix migration and redeploy.

---

## Common Operations

### View Application Logs

```bash
# Docker container logs (structured JSON in prod)
docker logs -f <container_name>

# Parse structured logs with jq
docker logs <container_name> 2>&1 | jq '.'

# Filter by log level
docker logs <container_name> 2>&1 | jq 'select(.level == "ERROR")'

# Filter by trace ID (for distributed tracing)
docker logs <container_name> 2>&1 | jq 'select(.traceId == "<trace-id>")'
```

### Change Log Levels at Runtime

```bash
# View current log levels
curl -s http://localhost:8080/management/loggers | jq '.loggers["io.github.jhipster.sample"]'

# Set a logger to DEBUG
curl -X POST http://localhost:8080/management/loggers/io.github.jhipster.sample \
  -H "Content-Type: application/json" \
  -d '{"configuredLevel":"DEBUG"}'

# Reset to default
curl -X POST http://localhost:8080/management/loggers/io.github.jhipster.sample \
  -H "Content-Type: application/json" \
  -d '{"configuredLevel":null}'
```

### Query Custom Business Metrics

```promql
# Total accounts created
business_accounts_created_total

# Operations created per minute
rate(business_operations_created_total[5m]) * 60

# Total balance across all accounts
business_accounts_total_balance_currency

# Operation amount P95
business_operations_amount_currency{quantile="0.95"}

# Active account count
business_accounts_count
```

### Start/Stop Monitoring Stack

```bash
# Start
docker compose -f src/main/docker/monitoring.yml up -d

# Stop
docker compose -f src/main/docker/monitoring.yml down

# View logs
docker compose -f src/main/docker/monitoring.yml logs -f
```

### Verify Prometheus Alert Rules

```bash
# Check loaded rules in Prometheus
curl -s http://localhost:9090/api/v1/rules | jq '.data.groups[].rules[] | {name: .name, state: .state, health: .health}'

# Check currently firing alerts
curl -s http://localhost:9090/api/v1/alerts | jq '.data.alerts[] | {alertname: .labels.alertname, state: .state}'
```

### Check Distributed Tracing

When OTLP exporter is configured, trace context (traceId, spanId) is automatically included in:
- Structured JSON logs (prod profile)
- HTTP response headers (when propagation is enabled)
- Prometheus exemplars

```bash
# Find trace ID in logs
docker logs <container> 2>&1 | jq '{timestamp, traceId, spanId, message}'

# Correlate logs by trace ID
docker logs <container> 2>&1 | jq 'select(.traceId == "abc123def456")'
```
