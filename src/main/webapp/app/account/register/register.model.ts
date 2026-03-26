/** Payload sent to POST /api/register to create a new user account. */
export class Registration {
  constructor(
    public login: string,
    public email: string,
    public password: string,
    public langKey: string,
  ) {}
}
