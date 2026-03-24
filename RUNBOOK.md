# Operational Runbook - JHipster Sample Application

> **Last Updated:** 2026-03-23
> **Audience:** On-call engineers, SREs, and platform operators
> **Severity:** This document covers production operations for the JHipster Sample Banking Application

---

## Table of Contents

1. [Service Overview](#1-service-overview)
2. [SLOs/SLIs](#2-slosslis)
3. [Monitoring & Dashboards](#3-monitoring--dashboards)
4. [Alert Reference](#4-alert-reference)
5. [Common Operations](#5-common-operations)
6. [Logging](#6-logging)
7. [Tracing](#7-tracing)
8. [Database](#8-database)
9. [Incident Response](#9-incident-response)
10. [Contact & Escalation](#10-contact--escalation)

---

## 1. Service Overview

### What the Application Does

The JHipster Sample Application is a **banking account management system** that allows users to:

- Manage bank accounts (create, view, update, delete)
- Record financial operations (transactions) with dates, amounts, and descriptions
- Categorize operations using labels
- Register, authenticate, and manage user profiles

### Technology Stack

| Component       | Technology                                       |
| --------------- | ------------------------------------------------ |
| Language        | Java 21                                          |
| Backend         | Spring Boot 4.0.2 (JHipster 9)                   |
| Frontend        | Angular 21.x, TypeScript, Bootstrap              |
| Database (prod) | PostgreSQL 18.x                                  |
| Database (dev)  | H2 in-memory                                     |
| Migrations      | Liquibase                                        |
| Cache           | Ehcache (JCache)                                 |
| Auth            | JWT (OAuth2 Resource Server)                     |
| Build           | Maven 3.2.5+, npm/Node.js 24.x                   |
| Container       | Docker, Jib                                      |
| Monitoring      | Prometheus, Grafana, Micrometer                  |
| Tracing         | OpenTelemetry, Micrometer Tracing, Grafana Tempo |

### Architecture

```
                    +-------------------+
                    |   Load Balancer   |
                    +--------+----------+
                             |
                    +--------v----------+
                    |   Spring Boot     |
                    |   Monolith        |
                    |   (Embedded       |
                    |    Tomcat)        |
                    |   Port: 8080      |
                    +----+----+----+----+
                         |    |    |
              +----------+    |    +-----------+
              |               |                |
     +--------v---+   +------v------+   +-----v-------+
     | PostgreSQL  |   | Prometheus  |   | Grafana     |
     | Port: 5432  |   | Port: 9090  |   | Tempo       |
     +-------------+   +-------------+   | Port: 3000  |
                                          | Port: 3200  |
                                          +-------------+
```

### Key Endpoints

| Endpoint                  | Method(s)              | Purpose                                       | Auth Required                    |
| ------------------------- | ---------------------- | --------------------------------------------- | -------------------------------- |
| `/api/bank-accounts`      | GET, POST              | List/create bank accounts                     | Yes                              |
| `/api/bank-accounts/{id}` | GET, PUT, DELETE       | Read/update/delete a specific bank account    | Yes                              |
| `/api/operations`         | GET, POST              | List (paginated)/create financial operations  | Yes                              |
| `/api/operations/{id}`    | GET, PUT, DELETE       | Read/update/delete a specific operation       | Yes                              |
| `/api/labels`             | GET, POST              | List/create labels                            | Yes                              |
| `/api/labels/{id}`        | GET, PUT, DELETE       | Read/update/delete a specific label           | Yes                              |
| `/api/authenticate`       | POST                   | Obtain JWT token                              | No                               |
| `/api/register`           | POST                   | Register new user account                     | No                               |
| `/api/account`            | GET, POST              | Get/update current user account               | Yes                              |
| `/api/admin/users`        | GET, POST, PUT, DELETE | Admin user management                         | ROLE_ADMIN                       |
| `/management/health`      | GET                    | Application health check (liveness/readiness) | No (basic), ROLE_ADMIN (details) |
| `/management/prometheus`  | GET                    | Prometheus metrics scrape endpoint            | No                               |
| `/management/info`        | GET                    | Application info (git, build)                 | No                               |
| `/management/loggers`     | GET, POST              | View/change log levels at runtime             | ROLE_ADMIN                       |
| `/management/threaddump`  | GET                    | JVM thread dump                               | ROLE_ADMIN                       |
| `/management/liquibase`   | GET                    | Liquibase migration status                    | ROLE_ADMIN                       |

---

## 2. SLOs/SLIs

### Service Level Objectives

| SLO               | Target | Measurement Window |
| ----------------- | ------ | ------------------ |
| Availability      | 99.9%  | Rolling 30 days    |
| API Latency (P99) | < 1s   | Rolling 5 minutes  |
| Error Rate        | < 0.1% | Rolling 5 minutes  |

### Service Level Indicators

#### Availability SLI

**Definition:** Percentage of successful HTTP responses (non-5xx) out of total requests.

```promql
# Availability over the last 30 days
1 - (
  sum(increase(http_server_requests_seconds_count{status=~"5.."}[30d]))
  /
  sum(increase(http_server_requests_seconds_count[30d]))
)
```

#### Latency SLI (P99)

**Definition:** 99th percentile response time for API endpoints.

```promql
# P99 latency for all API endpoints over the last 5 minutes
histogram_quantile(0.99,
  sum(rate(http_server_requests_seconds_bucket{uri=~"/api/.*"}[5m])) by (le)
)
```

#### Error Rate SLI

**Definition:** Rate of 5xx responses divided by total request rate.

```promql
# Error rate over the last 5 minutes
sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m]))
/
sum(rate(http_server_requests_seconds_count[5m]))
```

### How SLIs Are Measured

- All metrics are collected by **Micrometer** and exposed at `/management/prometheus`
- **Prometheus** scrapes the metrics endpoint every **15 seconds** (configurable in `prometheus.yml`)
- Distribution percentile histograms are enabled for all metrics via:
  ```yaml
  management.metrics.distribution.percentiles-histogram.all: true
  management.metrics.distribution.percentiles.all: 0, 0.5, 0.75, 0.95, 0.99, 1.0
  ```
- Application label `jhipsterSampleApplication` is attached to all metrics via `management.metrics.tags.application`

---

## 3. Monitoring & Dashboards

### Accessing Grafana

| Property    | Value                         |
| ----------- | ----------------------------- |
| URL         | http://localhost:3000         |
| Username    | `admin`                       |
| Password    | `admin`                       |
| Data Source | Prometheus (auto-provisioned) |

> **Note:** On first login, Grafana will prompt to change the admin password. In dev environments, you can skip this.

### Starting the Monitoring Stack

```bash
docker compose -f src/main/docker/monitoring.yml up -d
```

This starts:

- **Prometheus** on port `9090` (scraping `/management/prometheus` on the app at `localhost:8080`)
- **Grafana** on port `3000` (pre-configured with Prometheus data source)
- **Tempo** on ports `3200` (HTTP API) and `4318` (OTLP receiver)

### Dashboard: API Performance

**Purpose:** Monitor HTTP request rates, error rates, and latency distributions for all API endpoints.

| Panel                    | What It Shows                                           | Key Metric                                                         |
| ------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------ |
| Request Rate             | Total HTTP requests per second, broken down by endpoint | `rate(http_server_requests_seconds_count[1m])`                     |
| Error Rate               | 5xx error rate as a percentage of total requests        | `rate(http_server_requests_seconds_count{status=~"5.."}[1m])`      |
| P50/P95/P99 Latency      | Response time percentiles across all endpoints          | `histogram_quantile(0.99, ...http_server_requests_seconds_bucket)` |
| Latency by Endpoint      | Per-endpoint latency breakdown                          | Grouped by `uri` label                                             |
| Status Code Distribution | Breakdown of 2xx, 3xx, 4xx, 5xx responses               | `http_server_requests_seconds_count` grouped by `status`           |
| Slowest Endpoints        | Top endpoints by P99 latency                            | `topk(10, histogram_quantile(...))`                                |

**When to check:** During high-traffic events, after deployments, or when latency alerts fire.

### Dashboard: Business Metrics

**Purpose:** Track application-specific banking business metrics.

| Panel                         | What It Shows                                 | Key Metric                     |
| ----------------------------- | --------------------------------------------- | ------------------------------ |
| Bank Account Count            | Current number of bank accounts (gauge)       | `bank_account_count`           |
| Bank Account Total Balance    | Sum of all bank account balances (gauge)      | `bank_account_total_balance`   |
| Bank Account Creations        | Rate of new bank account creation             | `bank_account_created_total`   |
| Bank Account Updates          | Rate of bank account updates                  | `bank_account_updated_total`   |
| Bank Account Deletions        | Rate of bank account deletions                | `bank_account_deleted_total`   |
| Operation Count               | Current number of operations (gauge)          | `operation_count`              |
| Operation Creations           | Rate of new operation creation                | `operation_created_total`      |
| Operation Amount Distribution | Statistical distribution of operation amounts | `operation_amount` (histogram) |

**When to check:** To understand business activity patterns, validate feature releases, or investigate anomalies in user behavior.

### Dashboard: Database Pool

**Purpose:** Monitor HikariCP connection pool health and database connectivity.

| Panel                    | What It Shows                                       | Key Metric                              |
| ------------------------ | --------------------------------------------------- | --------------------------------------- |
| Active Connections       | Number of currently active (in-use) connections     | `hikaricp_connections_active`           |
| Idle Connections         | Number of idle connections in the pool              | `hikaricp_connections_idle`             |
| Pending Connections      | Threads waiting for a connection                    | `hikaricp_connections_pending`          |
| Total Connections        | Total connections (active + idle)                   | `hikaricp_connections`                  |
| Connection Acquire Time  | Time to acquire a connection from the pool          | `hikaricp_connections_acquire_seconds`  |
| Connection Usage Time    | How long connections are held before being returned | `hikaricp_connections_usage_seconds`    |
| Connection Creation Time | Time to create new physical connections             | `hikaricp_connections_creation_seconds` |
| Connection Timeout Rate  | Rate of connection acquisition timeouts             | `hikaricp_connections_timeout_total`    |
| Pool Utilization %       | `active / max` as a percentage                      | Calculated panel                        |

**When to check:** When latency increases, when database-related alerts fire, or during capacity planning.

### Dashboard: JVM (Micrometer)

**Purpose:** Standard JVM monitoring dashboard (pre-provisioned, based on Grafana dashboard #4701).

| Panel              | What It Shows                                                     | Key Metric                                          |
| ------------------ | ----------------------------------------------------------------- | --------------------------------------------------- |
| Uptime             | Application uptime since last restart                             | `process_uptime_seconds`                            |
| Start Time         | When the application was last started                             | `process_start_time_seconds`                        |
| Heap Used %        | Current JVM heap memory utilization                               | `jvm_memory_used_bytes{area="heap"}`                |
| Non-Heap Used %    | Current JVM non-heap memory utilization                           | `jvm_memory_used_bytes{area="nonheap"}`             |
| HTTP Rate          | Overall HTTP request rate                                         | `http_server_requests_seconds_count`                |
| HTTP Errors        | 5xx HTTP error rate                                               | `http_server_requests_seconds_count{status=~"5.."}` |
| JVM Memory Pools   | Detailed breakdown by memory pool (Eden, Survivor, Old Gen, etc.) | `jvm_memory_used_bytes` by `id`                     |
| GC Pause Duration  | Garbage collection pause times                                    | `jvm_gc_pause_seconds`                              |
| GC Allocation Rate | Rate of memory allocation triggering GC                           | `jvm_gc_memory_allocated_bytes_total`               |
| Threads            | JVM thread count by state (runnable, waiting, blocked, etc.)      | `jvm_threads_states_threads`                        |
| CPU Usage          | System and process CPU utilization                                | `system_cpu_usage`, `process_cpu_usage`             |
| Class Loading      | Loaded/unloaded class counts                                      | `jvm_classes_loaded_classes`                        |
| File Descriptors   | Open file descriptor count                                        | `process_files_open_files`                          |
| Log Events         | Logback event rates by level (error, warn, info, debug)           | `logback_events_total`                              |

**When to check:** After restarts, when GC pressure or memory alerts fire, during performance investigations.

---

## 4. Alert Reference

### 4.1 HighErrorRate

| Property       | Value                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Severity**   | critical                                                                                                            |
| **Expression** | `rate(http_server_requests_seconds_count{status=~"5.."}[5m]) / rate(http_server_requests_seconds_count[5m]) > 0.05` |
| **Duration**   | 5 minutes                                                                                                           |
| **Meaning**    | More than 5% of HTTP requests are returning 5xx errors over a 5-minute window                                       |

**Likely Causes:**

- Bad deployment (new code introduced a bug)
- Downstream service failure (database, external API)
- Database connectivity issues (connection pool exhaustion, PostgreSQL down)
- Resource exhaustion (OOM, disk full)
- Configuration error (bad environment variable, missing secret)

**Diagnostic Steps:**

1. Check recent deployments:
   ```bash
   git log --oneline -10
   ```
2. Check application logs for exceptions:

   ```bash
   # Structured JSON logs
   cat /var/log/app/application.log | jq 'select(.level == "ERROR")' | head -50

   # Or grep for stack traces
   grep -A 20 "ERROR" /var/log/app/application.log | head -100
   ```

3. Check which endpoints are failing:
   ```promql
   topk(5, sum by (uri, status) (rate(http_server_requests_seconds_count{status=~"5.."}[5m])))
   ```
4. Check database connectivity:
   ```bash
   curl -s http://localhost:8080/management/health | jq '.components.db'
   ```
5. Check recent error rate by status code:
   ```promql
   sum by (status) (rate(http_server_requests_seconds_count{status=~"5.."}[5m]))
   ```

**Remediation:**

- If caused by a bad deployment: **rollback immediately**
  ```bash
  # If using Docker
  docker compose -f src/main/docker/app.yml down
  # Deploy previous known-good image version
  ```
- If caused by downstream failure: check downstream service health, restart if necessary
- If caused by database issues: see [HikariPoolExhaustion](#44-hikaripoolexhaustion) section
- If caused by resource exhaustion: scale up or restart the instance

**Escalation:** If error rate does not decrease within 15 minutes of remediation, escalate to SEV1. See [Incident Response](#9-incident-response).

---

### 4.2 HighLatencyP99

| Property       | Value                                                                         |
| -------------- | ----------------------------------------------------------------------------- |
| **Severity**   | warning                                                                       |
| **Expression** | `histogram_quantile(0.99, rate(http_server_requests_seconds_bucket[5m])) > 2` |
| **Duration**   | 5 minutes                                                                     |
| **Meaning**    | The 99th percentile latency for HTTP requests exceeds 2 seconds               |

**Likely Causes:**

- Slow database queries (missing indexes, full table scans, lock contention)
- HikariCP connection pool exhaustion (all connections in use, threads waiting)
- JVM GC pressure (long GC pauses, insufficient heap)
- High traffic / resource contention
- N+1 query patterns in JPA/Hibernate
- Slow external service calls

**Diagnostic Steps:**

1. Identify the slowest endpoints:
   ```promql
   topk(5, histogram_quantile(0.99,
     sum by (uri, le) (rate(http_server_requests_seconds_bucket{uri=~"/api/.*"}[5m]))
   ))
   ```
2. Check connection pool metrics:
   ```promql
   hikaricp_connections_pending{pool="Hikari"}
   hikaricp_connections_acquire_seconds_max{pool="Hikari"}
   ```
3. Check GC activity:
   ```promql
   rate(jvm_gc_pause_seconds_sum[5m])
   jvm_gc_pause_seconds_max
   ```
4. Check Hibernate query statistics (if enabled):
   ```bash
   curl -s http://localhost:8080/management/metrics/hibernate.query.executions
   ```
5. Check thread dump for blocked threads:
   ```bash
   curl -s http://localhost:8080/management/threaddump | jq '.threads[] | select(.threadState == "BLOCKED")'
   ```
6. Check traces in Tempo for slow request paths (see [Tracing](#7-tracing))

**Remediation:**

- **Slow queries:** Add database indexes, optimize queries, review Hibernate fetch strategies
- **Pool exhaustion:** Increase pool size (see [Database section](#8-database)), investigate connection leaks
- **GC pressure:** Increase heap size (`-Xmx`), review allocation patterns
  ```bash
  # Adjust JVM options
  export _JAVA_OPTIONS="-Xmx1g -Xms512m"
  ```
- **N+1 queries:** Add `@EntityGraph` or `JOIN FETCH` to repository methods

**Escalation:** If latency does not improve within 30 minutes, and it is impacting user experience, escalate to SEV2.

---

### 4.3 JvmHeapHigh

| Property       | Value                                                                          |
| -------------- | ------------------------------------------------------------------------------ |
| **Severity**   | critical                                                                       |
| **Expression** | `jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"} > 0.9` |
| **Duration**   | 5 minutes                                                                      |
| **Meaning**    | JVM heap memory usage is above 90% of the configured maximum                   |

**Likely Causes:**

- Memory leak (objects not being garbage collected)
- Insufficient heap allocation for the workload
- Large result sets being loaded into memory (e.g., unpaginated queries)
- Excessive caching (Ehcache entries exceeding limits)
- Burst of traffic creating many short-lived objects faster than GC can reclaim

**Diagnostic Steps:**

1. Check current heap usage and trend:
   ```promql
   jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}
   ```
2. Check GC activity (frequent full GC indicates memory pressure):
   ```promql
   rate(jvm_gc_pause_seconds_count{action=~".*major.*|.*old.*"}[5m])
   ```
3. Check if it's a gradual leak or sudden spike (review graph over 24h)
4. Take a heap dump for analysis:

   ```bash
   # Find the Java process
   jps -l

   # Generate heap dump
   jmap -dump:live,format=b,file=/tmp/heapdump.hprof <PID>

   # Or via JMX
   jcmd <PID> GC.heap_dump /tmp/heapdump.hprof
   ```

5. Take a thread dump to see what is holding references:
   ```bash
   curl -s http://localhost:8080/management/threaddump > /tmp/threaddump.json
   ```
6. Check cache sizes:
   ```bash
   curl -s http://localhost:8080/management/caches
   ```

**Remediation:**

- **Immediate relief:** Trigger a manual GC (temporary measure only):
  ```bash
  jcmd <PID> GC.run
  ```
- **Insufficient heap:** Increase heap size:
  ```bash
  export _JAVA_OPTIONS="-Xmx2g -Xms1g"
  ```
- **Memory leak:** Analyze heap dump with Eclipse MAT or VisualVM, identify dominator tree, fix the leak
- **Large result sets:** Ensure all list endpoints use pagination (check `Pageable` parameters)
- **Cache issues:** Review Ehcache configuration:
  ```yaml
  # application.yml
  jhipster.cache.ehcache.max-entries: 1000 # prod default
  jhipster.cache.ehcache.time-to-live-seconds: 3600 # 1 hour TTL
  ```

**Escalation:** If heap usage stays above 95% and a restart does not resolve it, escalate to SEV2 for memory leak investigation.

---

### 4.4 HikariPoolExhaustion

| Property       | Value                                                                                   |
| -------------- | --------------------------------------------------------------------------------------- |
| **Severity**   | critical                                                                                |
| **Expression** | `hikaricp_connections_active / hikaricp_connections_max > 0.9`                          |
| **Duration**   | 2 minutes                                                                               |
| **Meaning**    | HikariCP connection pool utilization exceeds 90% (active connections / max connections) |

**Likely Causes:**

- Connection leak (connections acquired but never returned due to exceptions or missing `try-with-resources`)
- Slow queries holding connections for extended periods
- Insufficient pool size for the current request load
- Database server performance issues (slow responses)
- Long-running transactions not being committed/rolled back
- Deadlock in the database

**Diagnostic Steps:**

1. Check pool metrics:
   ```promql
   hikaricp_connections_active{pool="Hikari"}
   hikaricp_connections_idle{pool="Hikari"}
   hikaricp_connections_pending{pool="Hikari"}
   hikaricp_connections{pool="Hikari"}
   hikaricp_connections_timeout_total{pool="Hikari"}
   ```
2. Check connection usage duration:
   ```promql
   hikaricp_connections_usage_seconds_max{pool="Hikari"}
   ```
3. Check for long-running queries on PostgreSQL:
   ```sql
   SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
   FROM pg_stat_activity
   WHERE (now() - pg_stat_activity.query_start) > interval '30 seconds'
     AND state != 'idle'
   ORDER BY duration DESC;
   ```
4. Check for database locks:
   ```sql
   SELECT blocked_locks.pid AS blocked_pid,
          blocked_activity.usename AS blocked_user,
          blocking_locks.pid AS blocking_pid,
          blocking_activity.usename AS blocking_user,
          blocked_activity.query AS blocked_statement,
          blocking_activity.query AS blocking_statement
   FROM pg_catalog.pg_locks blocked_locks
   JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
   JOIN pg_catalog.pg_locks blocking_locks
     ON blocking_locks.locktype = blocked_locks.locktype
     AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
     AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
     AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
     AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
     AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
     AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
     AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
     AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
     AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
     AND blocking_locks.pid != blocked_locks.pid
   JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
   WHERE NOT blocked_locks.granted;
   ```
5. Check thread dump for threads blocked on connection acquisition:
   ```bash
   curl -s http://localhost:8080/management/threaddump | jq '.threads[] | select(.lockName != null and (.lockName | contains("Hikari")))'
   ```

**Remediation:**

- **Immediate:** Kill long-running queries on PostgreSQL:
  ```sql
  SELECT pg_terminate_backend(<pid>);
  ```
- **Connection leaks:** Review code for missing `@Transactional`, unclosed connections, or exception handling that skips connection return
- **Increase pool size** (temporarily or permanently):
  ```yaml
  # application-prod.yml
  spring:
    datasource:
      hikari:
        maximum-pool-size: 20 # default is 10
        minimum-idle: 5
        connection-timeout: 30000 # 30 seconds
        idle-timeout: 600000 # 10 minutes
        max-lifetime: 1800000 # 30 minutes
  ```
- **Slow queries:** Add missing indexes, optimize query plans

**Escalation:** If connection pool exhaustion persists after increasing pool size, escalate to SEV1.

---

### 4.5 InstanceDown

| Property       | Value                                                      |
| -------------- | ---------------------------------------------------------- |
| **Severity**   | critical                                                   |
| **Expression** | `up == 0`                                                  |
| **Duration**   | 1 minute                                                   |
| **Meaning**    | Prometheus cannot reach the application's metrics endpoint |

**Likely Causes:**

- Application crashed (unhandled exception, `System.exit()`)
- OOM kill by the operating system or container runtime
- Deployment in progress (temporary downtime)
- Network connectivity issue between Prometheus and the application
- Port conflict (another process bound to port 8080)
- Application failed to start (configuration error, database unavailable)

**Diagnostic Steps:**

1. Check if the process is running:

   ```bash
   # Check process
   ps aux | grep java

   # Check if port 8080 is in use
   ss -tlnp | grep 8080
   ```

2. Check for OOM kill:

   ```bash
   dmesg | grep -i "oom\|killed" | tail -20

   # Docker
   docker inspect <container_id> | jq '.[0].State'
   ```

3. Check application health:
   ```bash
   curl -s http://localhost:8080/management/health
   ```
4. Check container logs:
   ```bash
   docker compose -f src/main/docker/app.yml logs --tail 100 app
   ```
5. Check system resources:
   ```bash
   free -h
   df -h
   top -bn1 | head -20
   ```

**Remediation:**

- **Application crashed:** Restart the application:

  ```bash
  # Docker
  docker compose -f src/main/docker/app.yml restart app

  # Or standalone
  java -jar target/jhipster-sample-application-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
  ```

- **OOM killed:** Increase memory limits or optimize application memory usage:
  ```bash
  export _JAVA_OPTIONS="-Xmx1g -Xms512m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp"
  ```
- **Deployment:** Verify the new deployment is healthy; if not, rollback
- **Database unavailable:** Check PostgreSQL status, restore connectivity

**Escalation:** If the instance cannot be recovered within 5 minutes, escalate to SEV1. If it's a recurring OOM kill, escalate to SEV2 for capacity planning.

---

### 4.6 HighInvalidTokenRate

| Property       | Value                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| **Severity**   | warning                                                                                                |
| **Expression** | `rate(security_authentication_invalid_tokens_total[5m]) > 1`                                           |
| **Duration**   | 5 minutes                                                                                              |
| **Meaning**    | The rate of invalid JWT token presentations exceeds 1 per second, indicating potential security issues |

**Likely Causes:**

- Expired JWT tokens (users with stale sessions)
- Brute-force or credential-stuffing attack
- Misconfigured client application sending malformed tokens
- JWT secret rotation without updating all clients
- Clock skew between token issuer and validator
- Token replay attempts from a compromised token

**Diagnostic Steps:**

1. Check which type of invalid tokens dominate:
   ```promql
   sum by (cause) (rate(security_authentication_invalid_tokens_total[5m]))
   ```
   Causes are: `invalid-signature`, `expired`, `unsupported`, `malformed`
2. Check access logs for source IPs of failed authentications:
   ```bash
   cat /var/log/app/application.log | jq 'select(.message | contains("Invalid JWT")) | {timestamp, requestId, message}' | head -20
   ```
3. Check if a single IP is generating most failures (potential attack):
   ```bash
   # From access logs or reverse proxy logs
   grep "401" /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -20
   ```
4. Check if the JWT secret was recently changed:
   ```bash
   git log --oneline --all -- '**/application-prod.yml' | head -5
   ```

**Remediation:**

- **Expired tokens (gradual increase):** This is normal behavior; ensure clients implement token refresh
- **Attack (spike from few IPs):** Block offending IPs at the load balancer or WAF:
  ```bash
  # Example: iptables block
  iptables -A INPUT -s <attacker_ip> -j DROP
  ```
- **Misconfigured client:** Identify and fix the client; check the `cause` dimension:
  - `malformed` -> Client is sending corrupted tokens
  - `invalid-signature` -> Client using wrong JWT secret
  - `unsupported` -> Client using unsupported token type
- **Secret rotation:** Ensure all instances and clients are using the new secret; consider a grace period with both old and new secrets
- **Clock skew:** Synchronize NTP across all servers:
  ```bash
  timedatectl status
  sudo systemctl restart systemd-timesyncd
  ```

**Escalation:** If the invalid token rate is accompanied by successful unauthorized access, escalate immediately to SEV1 as a security incident.

---

## 5. Common Operations

### Starting the Application

#### Development Mode (H2 in-memory database)

```bash
# Start backend + frontend concurrently
npm run watch

# Or start separately:
# Backend only (port 8080)
./mvnw

# Frontend dev server only (port 9060, proxies to 8080)
npm run start
```

#### Production Mode (PostgreSQL)

```bash
# Start PostgreSQL first
docker compose -f src/main/docker/services.yml up -d

# Run with prod profile
./mvnw -Pprod

# Or run the built JAR
java -jar target/jhipster-sample-application-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod
```

#### Docker Compose (Full Stack)

```bash
# Build the Docker image first
./mvnw -Pprod jib:dockerBuild

# Start app + PostgreSQL
docker compose -f src/main/docker/app.yml up -d
```

### Stopping the Application

```bash
# Graceful shutdown (configured with server.shutdown=graceful)
kill -SIGTERM <PID>

# Docker
docker compose -f src/main/docker/app.yml down

# Force stop (last resort)
kill -9 <PID>
```

### Running with Different Profiles

| Profile            | Command                    | Description                              |
| ------------------ | -------------------------- | ---------------------------------------- |
| `dev`              | `./mvnw`                   | H2 database, DEBUG logging, sample data  |
| `prod`             | `./mvnw -Pprod`            | PostgreSQL, INFO logging, no sample data |
| `prod,api-docs`    | `./mvnw -Pprod -Papi-docs` | Production + Swagger API docs enabled    |
| `dev,no-liquibase` | `./mvnw -Pno-liquibase`    | Skip database migrations                 |

Profiles can also be set via environment variable:

```bash
export SPRING_PROFILES_ACTIVE=prod
java -jar target/*.jar
```

### Starting the Monitoring Stack

```bash
# Start Prometheus + Grafana + Tempo
docker compose -f src/main/docker/monitoring.yml up -d

# Verify services are running
curl -s http://localhost:9090/-/healthy   # Prometheus
curl -s http://localhost:3000/api/health  # Grafana
curl -s http://localhost:3200/ready       # Tempo
```

### Stopping the Monitoring Stack

```bash
docker compose -f src/main/docker/monitoring.yml down

# To also remove volumes (warning: loses Prometheus data)
docker compose -f src/main/docker/monitoring.yml down -v
```

### Running Database Migrations

Liquibase migrations run automatically on application startup. To run them manually:

```bash
# Via Maven
./mvnw liquibase:update

# Check migration status
./mvnw liquibase:status

# Rollback last changeset
./mvnw liquibase:rollbackCount -Dliquibase.rollbackCount=1
```

Migration contexts:

- `dev, faker` - Development: includes schema + sample data
- `prod` - Production: schema only, no sample data

### Building the Application

```bash
# Full build with tests
./mvnw clean verify

# Production build (includes frontend optimization)
./mvnw -Pprod clean verify

# Skip tests (not recommended for releases)
./mvnw -Pprod clean verify -DskipTests

# Build Docker image
./mvnw -Pprod jib:dockerBuild
```

### Runtime Log Level Changes

Change log levels without restarting:

```bash
# Get current log level
curl -s http://localhost:8080/management/loggers/io.github.jhipster.sample | jq

# Set log level to DEBUG
curl -X POST http://localhost:8080/management/loggers/io.github.jhipster.sample \
  -H 'Content-Type: application/json' \
  -d '{"configuredLevel": "DEBUG"}'

# Set Hibernate SQL logging to DEBUG
curl -X POST http://localhost:8080/management/loggers/org.hibernate.SQL \
  -H 'Content-Type: application/json' \
  -d '{"configuredLevel": "DEBUG"}'

# Reset to default
curl -X POST http://localhost:8080/management/loggers/io.github.jhipster.sample \
  -H 'Content-Type: application/json' \
  -d '{"configuredLevel": null}'
```

---

## 6. Logging

### Log Format

#### Development Profile

Human-readable console output with color coding and MDC correlation fields:

```
2026-03-23T10:15:30.123Z  INFO 12345 --- [main] [req-uuid] [admin] [trace-id] [span-id] i.g.j.s.JhipsterSampleApplicationApp     : Started JhipsterSampleApplicationApp in 8.5 seconds
```

The console pattern includes `[requestId]`, `[userId]`, `[traceId]`, and `[spanId]` fields in colored output (yellow, blue, green, green respectively).

#### Production Profile (Structured JSON)

In production, `jhipster.logging.use-json-format` is set to `true` in `application-prod.yml`:

```json
{
  "timestamp": "2026-03-23T10:15:30.123Z",
  "level": "INFO",
  "logger": "io.github.jhipster.sample.web.rest.BankAccountResource",
  "message": "REST request to get BankAccount : 1",
  "thread": "http-nio-8080-exec-1",
  "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userId": "admin",
  "traceId": "0af7651916cd43dd8448eb211c80319c",
  "spanId": "b7ad6b7169203331"
}
```

### Correlation IDs

All log entries in production include these MDC (Mapped Diagnostic Context) fields:

| Field       | Source                                                | Purpose                                      |
| ----------- | ----------------------------------------------------- | -------------------------------------------- |
| `requestId` | `X-Request-ID` header or auto-generated UUID          | Correlate all logs for a single HTTP request |
| `userId`    | Extracted from Spring SecurityContext (JWT principal) | Identify which user triggered the request    |
| `traceId`   | OpenTelemetry / W3C Trace Context header              | Correlate logs across distributed services   |
| `spanId`    | OpenTelemetry / W3C Trace Context header              | Identify the specific span within a trace    |

These fields are populated by the `CorrelationIdFilter` (for `requestId` and `userId`) and by the Micrometer Tracing / OpenTelemetry bridge (for `traceId` and `spanId`). The filter also echoes the `requestId` back in the `X-Request-ID` response header for client-side correlation.

### Searching Logs

#### By Request ID

Use the `requestId` to find all log entries for a specific HTTP request:

```bash
# JSON logs
cat /var/log/app/application.log | jq 'select(.requestId == "a1b2c3d4-e5f6-7890-abcd-ef1234567890")'

# Docker logs
docker compose -f src/main/docker/app.yml logs app | grep "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

#### By Trace ID

Use the `traceId` to follow a request across the entire distributed trace:

```bash
# Find all log entries for a specific trace
cat /var/log/app/application.log | jq 'select(.traceId == "0af7651916cd43dd8448eb211c80319c")'
```

#### By User ID

Find all actions performed by a specific user:

```bash
cat /var/log/app/application.log | jq 'select(.userId == "admin")'
```

### Useful Log Queries

```bash
# All errors in the last hour
cat /var/log/app/application.log | jq 'select(.level == "ERROR")'

# All slow queries (if Hibernate SQL debug is enabled)
cat /var/log/app/application.log | jq 'select(.logger | startswith("org.hibernate"))'

# All authentication failures
cat /var/log/app/application.log | jq 'select(.message | contains("Invalid JWT"))'

# Count errors by logger
cat /var/log/app/application.log | jq -r 'select(.level == "ERROR") | .logger' | sort | uniq -c | sort -rn

# Find requests that took a long time (pair with traceId in Tempo)
cat /var/log/app/application.log | jq 'select(.level == "WARN" and (.message | contains("slow")))'

# All log entries for a specific endpoint
cat /var/log/app/application.log | jq 'select(.message | contains("/api/bank-accounts"))'
```

### Log Configuration

Logging is configured in `src/main/resources/logback-spring.xml`:

- **Console output:** Always enabled
- **CRLF sanitization:** Enabled via `CRLFLogConverter` to prevent log injection
- **Level defaults:** Set per-logger (see logback-spring.xml for full list)
- **Runtime changes:** Use `/management/loggers` endpoint (see [Common Operations](#5-common-operations))

---

## 7. Tracing

### Overview

Distributed tracing is implemented using:

- **OpenTelemetry** for trace context propagation and span creation
- **Micrometer Tracing** as the bridge between Spring Boot and OpenTelemetry
- **Grafana Tempo** as the trace backend
- **OTLP** (OpenTelemetry Protocol) for exporting traces to Tempo

### Finding Traces in Grafana Tempo

1. Open Grafana: http://localhost:3000
2. Navigate to **Explore** (compass icon in the left sidebar)
3. Select **Tempo** as the data source
4. Search by:
   - **Trace ID:** Paste the traceId directly into the search field
   - **Service name:** `jhipsterSampleApplication`
   - **Duration:** Filter traces by minimum duration (e.g., `> 1s`)
   - **Status:** Filter by error status
   - **Tags:** Filter by custom span attributes

### Correlating Logs with Traces

The `traceId` field in structured logs links directly to traces in Tempo:

1. Find the `traceId` in application logs:
   ```bash
   cat /var/log/app/application.log | jq '{traceId, message, level}' | head -20
   ```
2. Copy the `traceId` value (e.g., `0af7651916cd43dd8448eb211c80319c`)
3. In Grafana Tempo, paste the traceId to view the full trace waterfall
4. The trace shows:
   - Complete request timeline
   - Each span (HTTP handler, database query, cache lookup, etc.)
   - Span attributes (HTTP method, URL, status code, etc.)
   - Error details if any span failed

### Trace Propagation

Traces propagate across service boundaries using the **W3C Trace Context** standard:

- **Header:** `traceparent: 00-<traceId>-<spanId>-<flags>`
- **Example:** `traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01`
- Format breakdown:
  - `00` - Version
  - `0af7651916cd43dd8448eb211c80319c` - Trace ID (32 hex chars)
  - `b7ad6b7169203331` - Parent Span ID (16 hex chars)
  - `01` - Trace flags (01 = sampled)

When calling external services, include this header to maintain trace continuity:

```bash
# Example: manual propagation in curl
curl -H "traceparent: 00-${TRACE_ID}-${SPAN_ID}-01" http://external-service/api/endpoint
```

### Sampling Configuration

| Environment | Sampling Rate | Configuration                                      |
| ----------- | ------------- | -------------------------------------------------- |
| Development | 100%          | All traces are captured for debugging              |
| Production  | 10%           | 1 in 10 traces sampled to reduce overhead and cost |

Sampling is configured via Spring Boot properties:

- **`application.yml`** (base / dev default):

  ```yaml
  management:
    tracing:
      sampling:
        probability: 1.0 # 100% - capture all traces
      propagation:
        type: w3c
  ```

- **`application-prod.yml`** (production override):
  ```yaml
  management:
    tracing:
      sampling:
        probability: 0.1 # 10% - sample 1 in 10 traces
  ```

> **Note:** Adjust the production sampling rate based on traffic volume and Tempo storage capacity.

### Trace Export Configuration

Traces are exported to Tempo via OTLP. The OTLP exporter endpoint defaults to `http://localhost:4318` (HTTP/protobuf) and can be overridden via `management.otlp.tracing.endpoint`.

The `TracingConfiguration` class provides an OpenTelemetry `Resource` bean that tags every span with the application's service name (`jhipsterSampleApplication`).

The Tempo data source is auto-provisioned in Grafana via `src/main/docker/grafana/provisioning/datasources/datasource.yml`.

---

## 8. Database

### PostgreSQL Connection Details

| Property     | Development (H2)                        | Production (PostgreSQL)                                      |
| ------------ | --------------------------------------- | ------------------------------------------------------------ |
| JDBC URL     | `jdbc:h2:mem:jhipsterSampleApplication` | `jdbc:postgresql://localhost:5432/jhipsterSampleApplication` |
| Username     | `jhipsterSampleApplication`             | `jhipsterSampleApplication`                                  |
| Password     | (empty)                                 | (empty - trust auth in dev; **change in prod**)              |
| Port         | N/A (in-memory)                         | `5432`                                                       |
| Docker Image | N/A                                     | `postgres:18.1`                                              |

### Starting PostgreSQL

```bash
# Via Docker Compose
docker compose -f src/main/docker/postgresql.yml up -d

# Verify it's running
docker compose -f src/main/docker/postgresql.yml ps
pg_isready -h localhost -p 5432 -U jhipsterSampleApplication
```

### Connecting to PostgreSQL

```bash
# Direct connection
psql -h localhost -p 5432 -U jhipsterSampleApplication

# Docker exec
docker compose -f src/main/docker/postgresql.yml exec postgresql psql -U jhipsterSampleApplication
```

### HikariCP Connection Pool Configuration

Default configuration in `application-prod.yml`:

```yaml
spring:
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
    hikari:
      poolName: Hikari
      auto-commit: false # Transactions managed by Spring
```

HikariCP defaults (when not explicitly set):

| Parameter                  | Default Value | Description                                   | Recommended Tuning                     |
| -------------------------- | ------------- | --------------------------------------------- | -------------------------------------- |
| `maximum-pool-size`        | 10            | Max connections in the pool                   | 2x CPU cores for OLTP workloads        |
| `minimum-idle`             | 10 (= max)    | Min idle connections maintained               | Same as max for consistent performance |
| `connection-timeout`       | 30000ms       | Max time to wait for a connection             | 30s is reasonable; lower for fast-fail |
| `idle-timeout`             | 600000ms      | Max time a connection can sit idle            | 10 minutes                             |
| `max-lifetime`             | 1800000ms     | Max lifetime of a connection                  | 30 minutes (< DB timeout)              |
| `leak-detection-threshold` | 0 (disabled)  | Time before a connection is considered leaked | Set to 60000ms (1 min) in non-prod     |

**Tuning recommendations:**

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      leak-detection-threshold: 60000 # Enable in staging/dev
```

> **Important:** `auto-commit: false` is set because Spring manages transactions. The Hibernate property `hibernate.connection.provider_disables_autocommit` is also set to `true`, which allows Hibernate to delay acquiring a connection until it's actually needed (lazy connection acquisition).

### Liquibase Migration Troubleshooting

#### Check Migration Status

```bash
# Via Maven
./mvnw liquibase:status

# Via management endpoint
curl -s http://localhost:8080/management/liquibase | jq
```

#### Common Migration Issues

**Issue: "Waiting for changelog lock"**

Another instance or a crashed migration left the lock table locked.

```sql
-- Check lock status
SELECT * FROM databasechangeloglock;

-- Force unlock (use with caution)
UPDATE databasechangeloglock SET locked = false, lockgranted = null, lockedby = null WHERE id = 1;
```

**Issue: "Checksum mismatch for changeset"**

A previously applied changeset was modified.

```sql
-- View the stored checksum
SELECT id, filename, md5sum FROM databasechangelog WHERE id = '<changeset_id>';

-- Clear checksum to force re-calculation (only if change is safe)
UPDATE databasechangelog SET md5sum = null WHERE id = '<changeset_id>';
```

**Issue: Migration fails on startup**

```bash
# Skip Liquibase and start the app (for emergency investigation)
./mvnw -Pno-liquibase

# Or via environment variable
export SPRING_LIQUIBASE_ENABLED=false
java -jar target/*.jar
```

### Common Database Issues

| Issue                 | Symptoms                                 | Resolution                                                          |
| --------------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| Connection refused    | App fails to start with connection error | Verify PostgreSQL is running: `pg_isready -h localhost -p 5432`     |
| Too many connections  | `FATAL: too many connections for role`   | Increase `max_connections` in `postgresql.conf` or reduce pool size |
| Slow queries          | High latency, pool exhaustion            | Run `EXPLAIN ANALYZE` on slow queries, add indexes                  |
| Disk space exhaustion | Write errors, WAL growth                 | `VACUUM FULL`, archive old data, increase disk                      |
| Sequence exhaustion   | Inserts fail with sequence errors        | `ALTER SEQUENCE sequence_generator RESTART WITH <value>`            |
| Lock contention       | Requests timeout waiting for locks       | Identify blocking queries (see HikariPool section), kill them       |

---

## 9. Incident Response

### Severity Levels

| Severity | Name     | Definition                                                                           | Response Time     | Examples                                              |
| -------- | -------- | ------------------------------------------------------------------------------------ | ----------------- | ----------------------------------------------------- |
| SEV1     | Critical | Service is completely down or data integrity is compromised. All users affected.     | 15 minutes        | InstanceDown, data corruption, security breach        |
| SEV2     | Major    | Service is significantly degraded. Many users affected. Core functionality impaired. | 30 minutes        | HighErrorRate (>5%), DB pool exhausted, memory leak   |
| SEV3     | Minor    | Service is partially degraded. Some users affected. Non-core functionality impaired. | 2 hours           | HighLatencyP99, elevated error rate (<5%), minor bugs |
| SEV4     | Low      | Minor issue with no immediate user impact. Informational or cosmetic.                | Next business day | Warning alerts, log anomalies, capacity planning      |

### Incident Declaration

When an alert fires or an issue is reported, follow these steps:

1. **Acknowledge** the alert in your monitoring system
2. **Assess** severity using the definitions above
3. **Declare** the incident using the communication template below
4. **Investigate** using the relevant alert runbook section
5. **Communicate** status updates every 15 minutes (SEV1) or 30 minutes (SEV2)
6. **Resolve** and verify the fix
7. **Close** the incident and schedule a post-mortem (SEV1/SEV2)

### Communication Template

#### Incident Declaration

```
INCIDENT DECLARED - [SEV#] - [Brief Description]

Time Detected: YYYY-MM-DD HH:MM UTC
Severity: SEV#
Impact: [Description of user impact]
Affected Systems: [e.g., API endpoints, specific features]
Current Status: Investigating / Identified / Mitigating / Resolved
Incident Commander: [Name]

Next Update: [Time of next update]
```

#### Status Update

```
INCIDENT UPDATE - [SEV#] - [Brief Description]

Update #: [number]
Time: YYYY-MM-DD HH:MM UTC
Current Status: Investigating / Identified / Mitigating / Resolved
Summary: [What we know so far]
Actions Taken: [What has been done]
Next Steps: [What will be done next]

Next Update: [Time of next update]
```

#### Incident Resolution

```
INCIDENT RESOLVED - [SEV#] - [Brief Description]

Time Detected: YYYY-MM-DD HH:MM UTC
Time Resolved: YYYY-MM-DD HH:MM UTC
Duration: [total duration]
Root Cause: [Brief root cause]
Resolution: [What was done to fix it]
User Impact: [Duration and scope of impact]
Follow-up: [Post-mortem scheduled for YYYY-MM-DD]
```

### Post-Mortem Process

Post-mortems are **required** for all SEV1 and SEV2 incidents. They should be conducted within **5 business days** of resolution.

#### Post-Mortem Template

```markdown
# Post-Mortem: [Incident Title]

## Summary

- **Date:** YYYY-MM-DD
- **Duration:** X hours Y minutes
- **Severity:** SEV#
- **Impact:** [Number of users affected, revenue impact, etc.]
- **Authors:** [Names]

## Timeline (all times UTC)

| Time  | Event                        |
| ----- | ---------------------------- |
| HH:MM | Alert fired / Issue reported |
| HH:MM | Incident declared            |
| HH:MM | Root cause identified        |
| HH:MM | Mitigation applied           |
| HH:MM | Service restored             |
| HH:MM | Incident resolved            |

## Root Cause

[Detailed explanation of what went wrong and why]

## Detection

[How was the issue detected? Could we have detected it sooner?]

## Resolution

[What was done to resolve the issue?]

## Lessons Learned

### What went well

- [Item]

### What went poorly

- [Item]

### Where we got lucky

- [Item]

## Action Items

| Action                       | Owner  | Priority | Due Date   |
| ---------------------------- | ------ | -------- | ---------- |
| [Specific corrective action] | [Name] | P1/P2/P3 | YYYY-MM-DD |

## Supporting Information

- [Links to dashboards, logs, traces]
- [Related incidents]
```

### Principles

- Post-mortems are **blameless** - focus on systems and processes, not individuals
- All action items must have an owner and a due date
- Post-mortem documents should be shared with the broader team for learning
- Review outstanding action items in team standups until complete

---

## 10. Contact & Escalation

### Team Contacts

| Role              | Name  | Contact | Availability     |
| ----------------- | ----- | ------- | ---------------- |
| Team Lead         | _TBD_ | _TBD_   | Business hours   |
| Backend Engineer  | _TBD_ | _TBD_   | Business hours   |
| Frontend Engineer | _TBD_ | _TBD_   | Business hours   |
| DBA               | _TBD_ | _TBD_   | Business hours   |
| SRE / Platform    | _TBD_ | _TBD_   | On-call rotation |
| Security          | _TBD_ | _TBD_   | On-call for SEV1 |

### On-Call Rotation

| Week         | Primary On-Call | Secondary On-Call | Escalation Contact |
| ------------ | --------------- | ----------------- | ------------------ |
| Current week | _TBD_           | _TBD_             | _TBD_              |

> **On-call schedule:** Managed in _[PagerDuty/OpsGenie/etc. - TBD]_
>
> **Shift hours:** 24/7 for SEV1, business hours for SEV3/SEV4
>
> **Handoff:** Occurs at 09:00 UTC every Monday

### Escalation Matrix

| Severity | First Responder          | Escalation (15 min) | Escalation (1 hr) | Escalation (4 hr)    |
| -------- | ------------------------ | ------------------- | ----------------- | -------------------- |
| SEV1     | Primary On-Call          | Secondary On-Call   | Team Lead         | Engineering Director |
| SEV2     | Primary On-Call          | Secondary On-Call   | Team Lead         | -                    |
| SEV3     | Primary On-Call          | Team Lead           | -                 | -                    |
| SEV4     | Team (next business day) | -                   | -                 | -                    |

### External Dependencies

| Service        | Contact / Support Portal | SLA          |
| -------------- | ------------------------ | ------------ |
| PostgreSQL     | Internal DBA team        | SEV1: 15 min |
| Infrastructure | Platform/SRE team        | SEV1: 15 min |
| DNS / CDN      | _TBD_                    | _TBD_        |
| Email (SMTP)   | _TBD_                    | _TBD_        |

---

## Appendix: Quick Reference

### Health Check Commands

```bash
# Application health
curl -s http://localhost:8080/management/health | jq

# Liveness probe
curl -s http://localhost:8080/management/health/liveness | jq

# Readiness probe (includes DB check)
curl -s http://localhost:8080/management/health/readiness | jq

# Prometheus metrics
curl -s http://localhost:8080/management/prometheus | head -50

# Application info (git commit, build version)
curl -s http://localhost:8080/management/info | jq
```

### Key Prometheus Queries

```promql
# Request rate (per second)
sum(rate(http_server_requests_seconds_count[1m]))

# Error rate (percentage)
sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) / sum(rate(http_server_requests_seconds_count[5m])) * 100

# P99 latency
histogram_quantile(0.99, sum(rate(http_server_requests_seconds_bucket[5m])) by (le))

# JVM heap usage percentage
sum(jvm_memory_used_bytes{area="heap"}) / sum(jvm_memory_max_bytes{area="heap"}) * 100

# Active DB connections
hikaricp_connections_active{pool="Hikari"}

# Pending DB connections (threads waiting)
hikaricp_connections_pending{pool="Hikari"}

# GC pause time rate
rate(jvm_gc_pause_seconds_sum[5m])

# Invalid token rate by cause
sum by (cause) (rate(security_authentication_invalid_tokens_total[5m]))

# Logback error event rate
rate(logback_events_total{level="error"}[5m])
```

### Emergency Procedures

| Situation                | Immediate Action                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| App not responding       | `docker compose -f src/main/docker/app.yml restart app`                                                                        |
| Database connection lost | `docker compose -f src/main/docker/services.yml restart postgresql`                                                            |
| OOM Kill                 | Restart with more memory: `_JAVA_OPTIONS="-Xmx2g" java -jar target/*.jar`                                                      |
| Disk full                | Clear logs: `truncate -s 0 /var/log/app/*.log` then investigate                                                                |
| Config error on start    | Start without Liquibase: `--spring.liquibase.enabled=false`                                                                    |
| Need heap dump           | `jcmd <PID> GC.heap_dump /tmp/heapdump.hprof`                                                                                  |
| Need thread dump         | `curl -s http://localhost:8080/management/threaddump > /tmp/threads.json`                                                      |
| Change log level         | `curl -X POST localhost:8080/management/loggers/<logger> -H 'Content-Type: application/json' -d '{"configuredLevel":"DEBUG"}'` |
