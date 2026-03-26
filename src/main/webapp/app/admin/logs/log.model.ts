/** Standard logging levels supported by Spring Boot Actuator loggers endpoint. */
export type Level = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'OFF';

/** A single logger entry from the Actuator `/management/loggers` response. */
export interface Logger {
  /** Explicitly configured level, or null if inheriting from parent. */
  configuredLevel: Level | null;
  /** Resolved level after inheritance. */
  effectiveLevel: Level;
}

/** Full response from the `/management/loggers` endpoint. */
export interface LoggersResponse {
  /** All available log levels. */
  levels: Level[];
  /** Map of logger name to its configuration. */
  loggers: Record<string, Logger>;
}

/** Simplified logger representation for display in the logs UI. */
export class Log {
  constructor(
    public name: string,
    public level: Level,
  ) {}
}
