import { IBankAccount } from 'app/entities/bank-account/bank-account.model';

export interface ITransfer {
  id: number;
  amount?: number | null;
  date?: string | null;
  description?: string | null;
  sourceAccount?: Pick<IBankAccount, 'id' | 'name' | 'balance'> | null;
  destinationAccount?: Pick<IBankAccount, 'id' | 'name' | 'balance'> | null;
}

export type NewTransfer = Omit<ITransfer, 'id'> & { id: null };
