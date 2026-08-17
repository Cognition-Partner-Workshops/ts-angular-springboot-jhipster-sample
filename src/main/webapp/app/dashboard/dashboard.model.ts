import dayjs from 'dayjs/esm';

export interface DashboardAccount {
  id: number;
  name: string;
  balance: number;
  operationCount: number;
}

export interface DashboardOperation {
  id: number;
  date: dayjs.Dayjs;
  description: string | null;
  amount: number;
  bankAccountName: string | null;
}

export type RestDashboardOperation = Omit<DashboardOperation, 'date'> & {
  date: string;
};

export interface AccountSummary {
  totalBalance: number;
  accountCount: number;
  operationCount: number;
  accounts: DashboardAccount[];
  recentOperations: DashboardOperation[];
}

export type RestAccountSummary = Omit<AccountSummary, 'recentOperations'> & {
  recentOperations: RestDashboardOperation[];
};
