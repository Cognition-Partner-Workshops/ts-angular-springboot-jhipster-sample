import { IBankAccount } from 'app/entities/bank-account/bank-account.model';

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';

export interface IInvoice {
  id: number;
  number?: string | null;
  date?: string | null;
  dueDate?: string | null;
  amount?: number | null;
  status?: InvoiceStatus | null;
  bankAccount?: Pick<IBankAccount, 'id' | 'name'> | null;
}

export type NewInvoice = Omit<IInvoice, 'id'> & { id: null };
