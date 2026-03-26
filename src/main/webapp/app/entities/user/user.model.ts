/** Minimal user projection used in entity relationships (e.g. BankAccount owner). */
export interface IUser {
  id: number;
  /** The user's login identifier (username). */
  login?: string | null;
}
