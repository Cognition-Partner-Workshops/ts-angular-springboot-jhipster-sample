export interface DashboardAccount {
  id: number;
  name: string;
  balance: number;
  operationCount: number;
}

export interface DashboardOperation {
  id: number;
  date: string;
  description: string | null;
  amount: number;
  bankAccountName: string | null;
}

export interface AccountSummary {
  totalBalance: number;
  accountCount: number;
  operationCount: number;
  accounts: DashboardAccount[];
  recentOperations: DashboardOperation[];
}
