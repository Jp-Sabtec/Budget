"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Currency, TaxDetails } from '@/types';
import { formatCurrency, convertToSelectedCurrency, CURRENCIES } from '@/lib/currency';

interface IncomeCardProps {
  salary: number;
  onSalaryChange: (salary: number) => void;
  taxDetails: TaxDetails | null;
  currency: Currency;
}

const IncomeDetailRow = ({ label, value, currency }: { label: string; value: number, currency: Currency }) => (
  <div className="flex items-center justify-between">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-medium">{formatCurrency(convertToSelectedCurrency(value, currency), currency)}</p>
  </div>
);


export default function IncomeCard({ salary, onSalaryChange, taxDetails, currency }: IncomeCardProps) {
  const currencySymbol = CURRENCIES[currency].symbol;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income & Tax</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="monthly-salary">Monthly Salary (before tax)</Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">{currencySymbol}</span>
            <Input
              id="monthly-salary"
              type="number"
              placeholder="e.g. 50000"
              value={convertToSelectedCurrency(salary, currency).toFixed(2)}
              onChange={(e) => {
                 const valueInSelectedCurrency = parseFloat(e.target.value) || 0;
                 const valueInZAR = valueInSelectedCurrency / CURRENCIES[currency].rate;
                 onSalaryChange(valueInZAR);
              }}
              className="pl-7"
            />
          </div>
        </div>

        {taxDetails && (
          <div className="space-y-2 rounded-lg border p-4">
            <h3 className="font-semibold">Tax Breakdown (SA)</h3>
            <IncomeDetailRow label="Gross Annual Income" value={taxDetails.grossAnnual} currency={currency} />
            <IncomeDetailRow label="Monthly Tax" value={taxDetails.monthlyTax} currency={currency} />
            <div className="border-t my-2"></div>
            <div className="flex items-center justify-between text-lg">
                <p className="font-semibold">Net Monthly Income</p>
                <p className="font-bold text-primary">{formatCurrency(convertToSelectedCurrency(taxDetails.netMonthly, currency), currency)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
