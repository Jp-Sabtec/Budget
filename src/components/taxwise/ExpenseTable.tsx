"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Currency, Expense } from '@/types';
import { formatCurrency, convertToSelectedCurrency } from '@/lib/currency';

interface ExpenseTableProps {
  expenses: Expense[];
  currency: Currency;
  onDelete: (id: string) => void;
}

export default function ExpenseTable({ expenses, currency, onDelete }: ExpenseTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No expenses added yet.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      {expense.category === 'Other' ? expense.customName : expense.category}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(convertToSelectedCurrency(expense.amount, currency), currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => onDelete(expense.id)} aria-label={`Delete expense ${expense.category}`}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
