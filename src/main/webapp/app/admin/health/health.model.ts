/** Possible states of a Spring Boot Actuator health indicator. */
export type HealthStatus = 'UP' | 'DOWN' | 'UNKNOWN' | 'OUT_OF_SERVICE';

/** Known health indicator component keys from Spring Boot Actuator. */
export type HealthKey = 'diskSpace' | 'ssl' | 'mail' | 'ping' | 'livenessState' | 'readinessState' | 'db';

/** Top-level response from the `/management/health` endpoint. */
export interface HealthModel {
  /** Aggregate status across all health components. */
  status: HealthStatus;
  /** Individual health indicator results keyed by component name. */
  components?: Partial<Record<HealthKey, HealthDetails>>;
}

/** Status and optional diagnostic details for a single health indicator. */
export interface HealthDetails {
  status: HealthStatus;
  /** Indicator-specific details (e.g. disk space free/total, DB product name). */
  details?: Record<string, unknown>;
}
