# Operational Runbook — JHipster Sample Application

## Table of Contents
1. [Application Overview](#1-application-overview)
2. [Observability Stack](#2-observability-stack)
3. [Dashboards](#3-dashboards)
4. [Alert Reference](#4-alert-reference)
5. [Common Troubleshooting Procedures](#5-common-troubleshooting-procedures)
6. [Incident Response](#6-incident-response)

---

## 1. Application Overview

### Architecture
- **Backend:** Spring Boot 4.0.2 (Java 21) with JPA/Hibernate
- **Frontend:** Angular SPA
- **Database:** PostgreSQL (production), H2 (development)
- **Authentication:** Spring Security with OAuth2 Resource Server (JWT)
- **Build Tool:** Maven

### Key Endpoints
| Endpoint | Purpose |
|---|---|
| `/api/bank-accounts` | Bank account CRUD operations |
| `/api/operations` | Financial operation management |
| `/api/labels` | Label management |
| `/management/health` | Health check (includes liveness and readiness) |
| `/management/health/liveness` | Kubernetes liveness probe |
| `/management/health/readiness` | Kubernetes readiness probe |
| `/management/prometheus` | Prometheus metrics endpoint |
| `/management/info` | Application info |

### Health Checks
- **Liveness:** `/management/health/liveness` — confirms the JVM is running
- **Readiness:** `/management/health/readiness` — confirms the app can serve traffic (DB connected, etc.)
- **Full health:** `/management/health` — comprehensive health including DB, disk space

---

## 2. Observability Stack

### Components

| Tool | Port | Purpose | Access |
|---|---|---|---|
| Prometheus | 9090 | Metrics collection and alerting | http://localhost:9090 |
| Grafana | 3000 | Dashboard visualization | http://localhost:3000 (admin/admin) |
| Tempo | 3200 | Distributed trace storage | http://localhost:3200 (API only) |
| Alertmanager | 9093 | Alert routing and notification | http://localhost:9093 |

### Starting the Stack
```bash
docker compose -f src/main/docker/monitoring.yml up -d
```

### Logging
- **Development:** Human-readable console output with `[traceId,spanId,requestId]` prefix
- **Production:** Structured JSON via LogstashEncoder with fields: `@timestamp`, `level`, `logger_name`, `message`, `thread_name`, `traceId`, `spanId`, `requestId`, `userId`

### Correlation IDs
Every HTTP request is tagged with:
- `requestId` — from `X-Request-ID` header or auto-generated UUID
- `traceId` — OpenTelemetry trace ID (propagated via W3C `traceparent` header)
- `spanId` — OpenTelemetry span ID
- `userId` — authenticated user principal (when available)

---

## 3. Dashboards

### Application Overview Dashboard
**Purpose:** RED metrics (Rate, Errors, Duration) for HTTP endpoints

**Key Panels:**
- HTTP Request Rate by endpoint
- HTTP Error Rate (5xx responses)
- HTTP Latency percentiles (p50, p95, p99)
- Total requests and error percentage stats
- Request duration heatmap

**When to Use:** First dashboard to check during any performance or availability incident.

### Business Metrics Dashboard
**Purpose:** Business activity tracking for bank accounts and operations

**Key Panels:**
- Account creation/deletion rates
- Active bank accounts gauge
- Operation rate by type (DEBIT/CREDIT)
- Operation amount distribution
- Account creation duration
- Invalid authentication token rate by cause

**When to Use:** When investigating business logic issues, unusual activity patterns, or verifying feature launches.

### JVM Infrastructure Dashboard
**Purpose:** JVM health and resource utilization

**Key Panels:**
- JVM Heap usage (used/committed/max)
- Garbage Collection pause duration and frequency
- HikariCP connection pool (active/idle/pending)
- Thread count by state
- CPU usage (process vs system)
- Logback events by level (error, warn, info)

**When to Use:** When investigating memory issues, slow responses, database connection problems, or high CPU.

---

## 4. Alert Reference

### HighErrorRate {#high-error-rate}

| Field | Value |
|---|---|
| **Severity** | Critical |
| **Trigger** | 5xx error rate > 5% for 5 minutes |
| **Expression** | `sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) / sum(rate(http_server_requests_seconds_count[5m])) > 0.05` |

**Likely Causes:**
- Database connectivity issues (connection pool exhausted, DB down)
- Downstream service failures
- Application bugs (null pointer exceptions, unhandled errors)
- Resource exhaustion (memory, threads)

**Remediation:**
1. Check Application Overview dashboard for which endpoints are failing
2. Check application logs for stack traces: search by recent `traceId` values
3. Check database connectivity via `/management/health`
4. Check HikariCP metrics on JVM Infrastructure dashboard
5. Review recent deployments for potential regressions
6. If DB issue, check PostgreSQL status and connection limits

**Escalation:** Page on-call engineer if not resolved within 15 minutes.

---

### HighLatency {#high-latency}

| Field | Value |
|---|---|
| **Severity** | Warning |
| **Trigger** | p99 HTTP latency > 2 seconds for 5 minutes |
| **Expression** | `histogram_quantile(0.99, sum(rate(http_server_requests_seconds_bucket[5m])) by (le)) > 2` |

**Likely Causes:**
- Slow database queries (missing indexes, full table scans)
- GC pressure causing stop-the-world pauses
- Connection pool saturation (all connections busy)
- Large payload processing
- Lock contention

**Remediation:**
1. Check JVM Infrastructure dashboard for GC pauses and heap pressure
2. Check HikariCP pending connections — if > 0, pool may be saturated
3. Search Tempo for slow traces to identify bottleneck spans
4. Check database slow query log
5. If GC-related, check heap usage trend and consider increasing `-Xmx`

**Escalation:** Notify team lead if latency persists beyond 30 minutes.

---

### JvmHeapHigh {#jvm-heap-high}

| Field | Value |
|---|---|
| **Severity** | Critical |
| **Trigger** | JVM heap usage > 90% for 5 minutes |
| **Expression** | `jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"} > 0.9` |

**Likely Causes:**
- Memory leak (objects not being garbage collected)
- Insufficient heap size for workload
- Large result sets loaded into memory (N+1 query patterns)
- Caching without eviction

**Remediation:**
1. Check JVM Infrastructure dashboard for heap usage trend
2. Check GC activity — frequent full GCs indicate memory pressure
3. If immediate risk of OOM:
   - Consider safe restart (see Section 5)
   - Capture heap dump before restart: `jcmd <pid> GC.heap_dump /tmp/heap.hprof`
4. Analyze heap dump with Eclipse MAT or VisualVM
5. Consider increasing `-Xmx` as a short-term fix
6. Check for N+1 query patterns in recent traces

**Escalation:** Page on-call engineer immediately if heap > 95%.

---

### HikariCPPoolExhaustion {#hikaricp-pool-exhaustion}

| Field | Value |
|---|---|
| **Severity** | Critical |
| **Trigger** | > 5 pending connection requests for 2 minutes |
| **Expression** | `hikaricp_connections_pending > 5` |

**Likely Causes:**
- Long-running database transactions holding connections
- Connection leak (connection acquired but not returned)
- Undersized connection pool for current load
- Database server overloaded or slow

**Remediation:**
1. Check JVM Infrastructure dashboard: active vs max connections
2. Check for long-running transactions in the database:
   ```sql
   SELECT pid, now() - pg_stat_activity.query_start AS duration, query
   FROM pg_stat_activity
   WHERE state != 'idle' ORDER BY duration DESC;
   ```
3. Consider increasing pool size: `spring.datasource.hikari.maximum-pool-size`
4. Check for missing `@Transactional` annotations causing connection leaks
5. Review recent code changes for transaction scope issues

**Escalation:** Page on-call engineer if pending connections > 10.

---

### InstanceDown {#instance-down}

| Field | Value |
|---|---|
| **Severity** | Critical |
| **Trigger** | Instance unreachable for 1 minute |
| **Expression** | `up == 0` |

**Likely Causes:**
- OOM kill (JVM exceeded container/host memory limits)
- Application crash (unhandled exception in startup)
- Network partition
- Deployment in progress
- Host/container failure

**Remediation:**
1. Check if deployment is currently in progress — if so, wait for completion
2. Check container/pod status:
   ```bash
   docker ps -a | grep jhipster
   # or
   kubectl get pods -l app=jhipster
   ```
3. Check for OOM events in system logs:
   ```bash
   dmesg | grep -i "out of memory"
   journalctl -u docker | grep OOM
   ```
4. Check application logs from before the crash
5. Restart if necessary (see Section 5)
6. If recurring, investigate root cause (memory leak, resource limits)

**Escalation:** Page on-call engineer immediately. If multiple instances are down, escalate to P1.

---

### HighInvalidTokenRate {#high-invalid-token-rate}

| Field | Value |
|---|---|
| **Severity** | Warning |
| **Trigger** | > 1 invalid token per second for 5 minutes |
| **Expression** | `rate(security_authentication_invalid_tokens_total[5m]) > 1` |

**Likely Causes:**
- Brute force or credential stuffing attack
- Expired tokens not being refreshed by clients
- Clock skew between auth server and application
- Misconfigured client application
- Key rotation without client update

**Remediation:**
1. Check Business Metrics dashboard for token error breakdown by cause
2. If cause is "expired":
   - Check client token refresh logic
   - Verify token TTL configuration
3. If cause is "invalid-signature":
   - Possible attack — check source IPs in structured logs
   - Verify JWKS endpoint is accessible
   - Check if auth server keys were recently rotated
4. Consider implementing rate limiting per IP/client
5. If attack suspected, block offending IPs at load balancer

**Escalation:** If sustained invalid token rate > 10/s, notify security team.

---

## 5. Common Troubleshooting Procedures

### Reading Structured JSON Logs

In production, logs are JSON-formatted. Use `jq` to parse:

```bash
# View recent logs with human-readable formatting
docker logs <container> --tail 100 | jq '.'

# Filter by log level
docker logs <container> --tail 1000 | jq 'select(.level == "ERROR")'

# Filter by requestId
docker logs <container> --tail 1000 | jq 'select(.requestId == "abc-123-def")'

# Filter by userId
docker logs <container> --tail 1000 | jq 'select(.userId == "user@example.com")'
```

### Finding a Request by traceId

1. Get the `traceId` from logs or from the `traceparent` response header
2. Search logs:
   ```bash
   docker logs <container> | jq 'select(.traceId == "<traceId>")'
   ```
3. Search in Grafana → Explore → Tempo → Enter the traceId
4. The trace view shows the full request path with timing for each span

### Correlating a User Complaint to a Trace

1. Get the approximate time of the issue from the user
2. If the user has the `X-Request-ID` response header value:
   ```bash
   docker logs <container> | jq 'select(.requestId == "<requestId>")'
   ```
3. Extract the `traceId` from the matching log entry
4. View the full trace in Grafana → Explore → Tempo
5. Alternatively, search by time range and user endpoint in Tempo

### Checking Database Health

```bash
# Via management endpoint
curl -s http://localhost:8080/management/health | jq '.components.db'

# Direct PostgreSQL check
psql -h localhost -U <user> -d <dbname> -c "SELECT 1;"

# Check active connections
psql -h localhost -U <user> -d <dbname> -c "SELECT count(*) FROM pg_stat_activity;"
```

### Safe Application Restart

1. Verify the instance is in a safe state to restart:
   - Check for in-flight requests (monitor request rate dropping)
   - Ensure no long-running batch jobs are active
2. If using containers:
   ```bash
   docker restart <container>
   ```
3. Monitor the restart:
   - Watch `/management/health/readiness` until it returns 200
   - Check Prometheus `up` metric returns to 1
   - Verify no errors in startup logs
4. Confirm traffic is flowing normally on Application Overview dashboard

---

## 6. Incident Response

### Severity Definitions

| Severity | Definition | Response Time | Examples |
|---|---|---|---|
| P1 - Critical | Service is completely down or severely degraded for all users | < 15 minutes | All instances down, data corruption, security breach |
| P2 - High | Major feature is broken or performance is severely degraded | < 30 minutes | High error rate (>5%), database connection failures |
| P3 - Medium | Minor feature is broken or performance is somewhat degraded | < 2 hours | Elevated latency, intermittent errors |
| P4 - Low | Cosmetic issue or minor inconvenience | Next business day | Dashboard display issues, log formatting |

### Escalation Matrix

| Alert | Initial Responder | Escalation (15 min) | Escalation (30 min) |
|---|---|---|---|
| InstanceDown | On-call engineer | Team lead | Engineering manager |
| HighErrorRate | On-call engineer | Team lead | Engineering manager |
| JvmHeapHigh | On-call engineer | Senior engineer | Team lead |
| HikariCPPoolExhaustion | On-call engineer | DBA + Senior engineer | Team lead |
| HighLatency | On-call engineer | Senior engineer | Team lead |
| HighInvalidTokenRate | On-call engineer | Security team | Security lead |

### Incident Communication Template

```
**Incident: [Title]**
**Severity:** P1/P2/P3/P4
**Status:** Investigating / Identified / Monitoring / Resolved
**Started:** [Timestamp]
**Duration:** [Duration]

**Impact:**
[Description of user-facing impact]

**Root Cause:**
[Description of root cause, or "Under investigation"]

**Remediation:**
[Steps taken or planned]

**Next Update:** [Time of next update]
```

### Post-Incident Review Process

1. **Within 24 hours:** Create incident report with timeline
2. **Within 48 hours:** Hold blameless post-mortem meeting
3. **Within 1 week:** Document action items with owners and deadlines
4. **Track:** Follow up on action items in regular team meetings

**Post-Mortem Template:**
- Incident summary and timeline
- Root cause analysis (5 Whys)
- What went well
- What could be improved
- Action items with owners and due dates
