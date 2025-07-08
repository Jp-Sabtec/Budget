export type Currency = 'ZAR' | 'USD' | 'EUR';

export type ExpenseCategory = string;

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
  expenseCategories: string[];
}

export interface TaxDetails {
  grossAnnual: number;
  taxableIncome: number;
  annualTax: number;
  monthlyTax: number;
  netMonthly: number;
}
