export interface Settings {
  name: string;
  currency: string;
  theme: 'light' | 'dark';
  timezone: string;
}

export type AccountType = 'cash' | 'bank' | 'credit' | 'e-wallet';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  icon: string;
  color: string;
  is_archived: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  parent_id?: string; // subcategory support
  icon: string;
  color: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  account_id: string;
  category_id?: string; // Optional for transfers
  to_account_id?: string; // Required for transfers
  type: TransactionType;
  amount: number;
  note: string;
  receipt_url?: string; // Base64 data URL
  transaction_date: string; // YYYY-MM-DD
  created_at: string; // ISO string
}

export interface Budget {
  id: string;
  category_id: string;
  amount: number;
  month: number; // 1-12
  year: number;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringRule {
  id: string;
  template_transaction: Omit<Transaction, 'id' | 'created_at'>;
  frequency: RecurringFrequency;
  start_date: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD (optional)
  next_run_date: string; // YYYY-MM-DD
}
