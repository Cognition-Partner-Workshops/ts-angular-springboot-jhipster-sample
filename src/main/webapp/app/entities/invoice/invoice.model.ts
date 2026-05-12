import dayjs from 'dayjs/esm';

import { IBankAccount } from 'app/entities/bank-account/bank-account.model';

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';

export interface IInvoice {
  id: number;
  number?: string | null;
  date?: dayjs.Dayjs | null;
  dueDate?: dayjs.Dayjs | null;
  amount?: number | null;
  status?: InvoiceStatus | null;
  bankAccount?: IBankAccount | null;
}

export type NewInvoice = Omit<IInvoice, 'id'> & { id: null };
