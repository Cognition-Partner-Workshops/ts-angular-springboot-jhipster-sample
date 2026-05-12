import { IBankAccount } from 'app/entities/bank-account/bank-account.model';

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';

export interface IInvoice {
  id: number;
  invoiceNumber?: string | null;
  invoiceDate?: string | null;
  dueDate?: string | null;
  amount?: number | null;
  status?: InvoiceStatus | null;
  bankAccount?: Pick<IBankAccount, 'id' | 'name'> | null;
}

export type NewInvoice = Omit<IInvoice, 'id'> & { id: null };
