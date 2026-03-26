import { IUser } from 'app/entities/user/user.model';

/** Represents a bank account entity linked to a user. */
export interface IBankAccount {
  id: number;
  /** Display name of the bank account. */
  name?: string | null;
  /** Current monetary balance. */
  balance?: number | null;
  /** The owning user (only id and login are projected). */
  user?: Pick<IUser, 'id' | 'login'> | null;
}

/** Type used when creating a new bank account (id is null until persisted). */
export type NewBankAccount = Omit<IBankAccount, 'id'> & { id: null };
