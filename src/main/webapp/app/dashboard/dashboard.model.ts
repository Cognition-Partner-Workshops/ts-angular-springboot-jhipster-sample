export interface IAccountSummaryAccount {
  id: number;
  name: string;
  balance: number;
  operationCount: number;
}

export interface IAccountSummaryOperation {
  id: number;
  date: string;
  description: string;
  amount: number;
  bankAccountName: string;
}

export interface IAccountSummary {
  totalBalance: number;
  accountCount: number;
  operationCount: number;
  accounts: IAccountSummaryAccount[];
  recentOperations: IAccountSummaryOperation[];
}
