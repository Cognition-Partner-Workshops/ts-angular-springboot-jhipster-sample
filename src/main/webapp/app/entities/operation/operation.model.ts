import dayjs from 'dayjs/esm';

import { IBankAccount } from 'app/entities/bank-account/bank-account.model';
import { ILabel } from 'app/entities/label/label.model';

export type PaymentType = 'PRINCIPAL' | 'INTEREST' | 'FEE' | 'OVERPAYMENT';

export interface IOperation {
  id: number;
  date?: dayjs.Dayjs | null;
  description?: string | null;
  amount?: number | null;
  paymentType?: PaymentType | null;
  bankAccount?: IBankAccount | null;
  labels?: ILabel[] | null;
}

export type NewOperation = Omit<IOperation, 'id'> & { id: null };
