import { ILoanAccount, NewLoanAccount } from './loan-account.model';

export const sampleWithRequiredData: ILoanAccount = {
  id: 1234,
  accountName: 'Test Loan',
  loanAmount: 200000,
  interestRate: 6.0,
  termMonths: 360,
};

export const sampleWithPartialData: ILoanAccount = {
  id: 5678,
  accountName: 'Partial Loan',
  loanAmount: 50000,
  interestRate: 5.0,
  termMonths: 60,
  monthlyPayment: 943.56,
};

export const sampleWithFullData: ILoanAccount = {
  id: 9012,
  accountName: 'Full Loan',
  loanAmount: 300000,
  interestRate: 3.5,
  termMonths: 180,
  monthlyPayment: 2145.22,
  remainingBalance: 250000,
};

export const sampleWithNewData: NewLoanAccount = {
  accountName: 'New Loan',
  loanAmount: 100000,
  interestRate: 4.5,
  termMonths: 120,
  id: null,
};
