/** Represents a security authority/role (e.g. ROLE_ADMIN, ROLE_USER). */
export interface IAuthority {
  /** The authority name, used as both the identifier and display value. */
  name: string;
}

/** Type used when creating a new authority (name is null until set). */
export type NewAuthority = Omit<IAuthority, 'name'> & { name: null };
