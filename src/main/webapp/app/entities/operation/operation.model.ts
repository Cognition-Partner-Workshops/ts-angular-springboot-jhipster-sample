import dayjs from 'dayjs/esm';

import { IBankAccount } from 'app/entities/bank-account/bank-account.model';
import { ILabel } from 'app/entities/label/label.model';

/** Represents a financial operation (transaction) on a bank account. */
export interface IOperation {
  id: number;
  /** Timestamp of the operation. */
  date?: dayjs.Dayjs | null;
  /** Optional description of the transaction. */
  description?: string | null;
  /** Transaction amount (positive for credits, negative for debits). */
  amount?: number | null;
  /** The bank account this operation belongs to. */
  bankAccount?: IBankAccount | null;
  /** Labels/tags categorizing this operation. */
  labels?: ILabel[] | null;
}

/** Type used when creating a new operation (id is null until persisted). */
export type NewOperation = Omit<IOperation, 'id'> & { id: null };
