"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownCircle, ArrowUpCircle, Banknote } from 'lucide-react';
import { Currency } from '@/types';
import { formatCurrency, convertToSelectedCurrency } from '@/lib/currency';

interface BudgetSummaryProps {
  netIncome: number;
  totalExpenses: number;
  remainingBalance: number;
  currency: Currency;
}

const SummaryItem = ({ icon: Icon, label, value, currency, className = '' }: { icon: React.ElementType, label: string, value: number, currency: Currency, className?: string }) => (
  <div className="flex items-center gap-4">
    <div className={`rounded-full p-2 bg-muted ${className}`}>
        <Icon className="h-6 w-6" />
    </div>
    <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{formatCurrency(convertToSelectedCurrency(value, currency), currency)}</p>
    </div>
  </div>
);

export default function BudgetSummary({ netIncome, totalExpenses, remainingBalance, currency }: BudgetSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SummaryItem icon={ArrowDownCircle} label="Net Income" value={netIncome} currency={currency} className="text-green-600" />
        <SummaryItem icon={ArrowUpCircle} label="Total Expenses" value={totalExpenses} currency={currency} className="text-red-600" />
        <SummaryItem icon={Banknote} label="Remaining Balance" value={remainingBalance} currency={currency} className="text-blue-600" />
      </CardContent>
    </Card>
  );
}
