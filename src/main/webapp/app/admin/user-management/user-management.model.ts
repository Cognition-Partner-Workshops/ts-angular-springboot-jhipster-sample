/** Full admin user representation including audit fields and authorities. */
export interface IUser {
  id: number | null;
  login?: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
  /** Whether the account has been activated (e.g. via email confirmation). */
  activated?: boolean;
  /** ISO 639 language code for the user's preferred locale. */
  langKey?: string;
  /** Assigned security roles (e.g. ROLE_ADMIN, ROLE_USER). */
  authorities?: string[];
  createdBy?: string;
  createdDate?: Date;
  lastModifiedBy?: string;
  lastModifiedDate?: Date;
}

/** Concrete admin user class used in user management forms and lists. */
export class User implements IUser {
  constructor(
    public id: number | null,
    public login?: string,
    public firstName?: string | null,
    public lastName?: string | null,
    public email?: string,
    public activated?: boolean,
    public langKey?: string,
    public authorities?: string[],
    public createdBy?: string,
    public createdDate?: Date,
    public lastModifiedBy?: string,
    public lastModifiedDate?: Date,
  ) {}
}
