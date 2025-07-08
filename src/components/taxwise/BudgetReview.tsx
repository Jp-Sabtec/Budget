"use client";

import React, { useState, useRef, ChangeEvent } from 'react';
import { BudgetState } from '@/types';
import { importFromJSON } from '@/lib/fileHandlers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, CURRENCIES, convertToSelectedCurrency } from '@/lib/currency';

type Actuals = Record<string, string>; // expense.id -> actual amount as string

export default function BudgetReview() {
  const [budget, setBudget] = useState<BudgetState | null>(null);
  const [actuals, setActuals] = useState<Actuals>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (file: File) => {
    const onImportSuccess = (data: BudgetState) => {
        setBudget(data);
        setActuals({}); // Reset actuals when new budget is loaded
        toast({
          title: "Import Successful",
          description: "Your budget data has been loaded for review.",
        });
    };

    const onImportError = (error: string) => {
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: error,
        });
    };
    
    importFromJSON(file, onImportSuccess, onImportError);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleActualsChange = (expenseId: string, value: string) => {
    setActuals(prev => ({ ...prev, [expenseId]: value }));
  };
  
  const totalBudgetedExpenses = budget?.expenses.reduce((acc, exp) => acc + exp.amount, 0) || 0;
  
  const totalActualExpensesZAR = budget ? Object.values(actuals).reduce((acc, value) => {
      const amount = parseFloat(value) || 0;
      return acc + (amount / CURRENCIES[budget.currency].rate);
  }, 0) : 0;
  
  const comparisonData = budget ? budget.expenses.map(expense => {
      const budgetedAmount = convertToSelectedCurrency(expense.amount, budget.currency);
      const actualAmount = parseFloat(actuals[expense.id]) || 0;
      const difference = budgetedAmount - actualAmount;
      return { ...expense, budgetedAmount, actualAmount, difference };
  }) : [];

  const totalDifferenceZAR = totalBudgetedExpenses - totalActualExpensesZAR;

  if (!budget) {
    return (
      <Card className="min-h-[60vh]">
        <CardHeader>
          <CardTitle>Review Your Monthly Budget</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 text-center h-full">
            <p className="text-muted-foreground">Import your saved budget JSON file to get started.</p>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".json"
            />
            <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Import Budget
            </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-end">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Import a Different Budget
            </Button>
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".json"
            />
        </div>
      <div id="pdf-review-content">
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                  <CardHeader><CardTitle>Expense Comparison</CardTitle></CardHeader>
                  <CardContent>
                      <div className="overflow-x-auto">
                      <Table>
                          <TableHeader>
                          <TableRow>
                              <TableHead>Category</TableHead>
                              <TableHead className="text-right">Budgeted</TableHead>
                              <TableHead className="w-[180px] text-center">Actual Spending</TableHead>
                              <TableHead className="text-right">Difference</TableHead>
                          </TableRow>
                          </TableHeader>
                          <TableBody>
                          {comparisonData.map((item) => (
                              <TableRow key={item.id}>
                                  <TableCell className="font-medium">{item.category === 'Other' ? item.customName : item.category}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(item.budgetedAmount, budget.currency)}</TableCell>
                                  <TableCell>
                                  <div className="relative mx-auto">
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">{CURRENCIES[budget.currency].symbol}</span>
                                      <Input
                                      type="number"
                                      placeholder="0.00"
                                      value={actuals[item.id] || ''}
                                      onChange={(e) => handleActualsChange(item.id, e.target.value)}
                                      className="pl-7 text-right"
                                      />
                                  </div>
                                  </TableCell>
                                  <TableCell className={`text-right font-medium ${item.difference < 0 ? 'text-destructive' : 'text-green-600'}`}>
                                      {formatCurrency(item.difference, budget.currency)}
                                  </TableCell>
                              </TableRow>
                          ))}
                          </TableBody>
                      </Table>
                      </div>
                  </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
              <Card>
                  <CardHeader><CardTitle>Review Summary</CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Budgeted</span>
                      <span className="font-medium">{formatCurrency(convertToSelectedCurrency(totalBudgetedExpenses, budget.currency), budget.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Actual</span>
                      <span className="font-medium">{formatCurrency(convertToSelectedCurrency(totalActualExpensesZAR, budget.currency), budget.currency)}</span>
                    </div>
                    <div className={`flex justify-between font-bold text-base pt-2 border-t ${totalDifferenceZAR < 0 ? 'text-destructive' : 'text-green-600'}`}>
                        <span>{totalDifferenceZAR < 0 ? 'Total Overspent' : 'Total Saved'}</span>
                        <span>{formatCurrency(convertToSelectedCurrency(Math.abs(totalDifferenceZAR), budget.currency), budget.currency)}</span>
                    </div>
                  </CardContent>
              </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
