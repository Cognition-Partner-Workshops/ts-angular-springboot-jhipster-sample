/** Credentials payload sent to POST /api/authenticate. */
export class Login {
  constructor(
    /** The user's login identifier. */
    public username: string,
    /** The user's password (plaintext, transmitted over HTTPS). */
    public password: string,
    /** When true, the JWT is stored in localStorage instead of sessionStorage. */
    public rememberMe: boolean,
  ) {}
}
