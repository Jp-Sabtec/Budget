export type Currency = 'ZAR' | 'USD' | 'EUR';

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Rent',
  'Medical Aid',
  'Other',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export interface Expense {
  id: string;
  category: ExpenseCategory;
  customName?: string;
  amount: number; // Always stored in ZAR
}

export interface BudgetState {
  monthlySalary: number; // Always stored in ZAR
  expenses: Expense[];
  currency: Currency;
}

export interface TaxDetails {
  grossAnnual: number;
  taxableIncome: number;
  annualTax: number;
  monthlyTax: number;
  netMonthly: number;
}
