/**
 * Represents the currently authenticated user's account information.
 * Fetched from GET /api/account after successful JWT authentication.
 */
export class Account {
  constructor(
    /** Whether the account has been activated via the email confirmation link. */
    public activated: boolean,
    /** Granted authority roles, e.g. ['ROLE_USER'] or ['ROLE_USER', 'ROLE_ADMIN']. */
    public authorities: string[],
    /** User's email address, also used for password reset. */
    public email: string,
    /** User's first name, displayed in the navbar and settings. */
    public firstName: string | null,
    /** Preferred language key (e.g. 'en', 'fr') for i18n. */
    public langKey: string,
    /** User's last name. */
    public lastName: string | null,
    /** Unique login identifier (username). */
    public login: string,
    /** URL of the user's avatar image. */
    public imageUrl: string | null,
  ) {}
}
