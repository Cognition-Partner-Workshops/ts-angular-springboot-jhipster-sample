/** Payload broadcast via {@link EventManager} when a custom application error needs to be displayed. */
export class AlertErrorModel {
  constructor(
    /** Human-readable error description. */
    public message: string,
    /** Optional i18n translation key. */
    public key?: string,
    /** Interpolation parameters for the translation. */
    public params?: Record<string, unknown>,
  ) {}
}
