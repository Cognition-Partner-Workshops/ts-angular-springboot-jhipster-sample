import { IUser } from 'app/entities/user/user.model';

export interface ILoanAccount {
  id: number;
  accountName?: string | null;
  loanAmount?: number | null;
  interestRate?: number | null;
  termMonths?: number | null;
  monthlyPayment?: number | null;
  remainingBalance?: number | null;
  user?: Pick<IUser, 'id' | 'login'> | null;
}

export type NewLoanAccount = Omit<ILoanAccount, 'id'> & { id: null };

export interface IAmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}
