"use client";

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Currency, Expense } from '@/types';
import { formatCurrency, convertToSelectedCurrency } from '@/lib/currency';

interface SpendingChartProps {
  expenses: Expense[];
  currency: Currency;
}

const COLORS = ['#6699CC', '#FFA07A', '#8884d8', '#82ca9d', '#ffc658', '#a4de6c', '#d0ed57', '#ff8042'];

const CustomTooltip = ({ active, payload, currency }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                {data.name}
              </span>
              <span className="font-bold text-muted-foreground">
                {formatCurrency(convertToSelectedCurrency(data.value, currency), currency)}
              </span>
            </div>
          </div>
        </div>
      );
    }
  
    return null;
  };

export default function SpendingChart({ expenses, currency }: SpendingChartProps) {
  const chartData = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(expense => {
      const name = expense.category === 'Other' ? expense.customName || 'Other' : expense.category;
      if (categoryTotals[name]) {
        categoryTotals[name] += expense.amount;
      } else {
        categoryTotals[name] = expense.amount;
      }
    });

    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [expenses]);
  

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="flex h-[350px] items-center justify-center">
            <p className="text-muted-foreground">No data to display. Add some expenses!</p>
          </div>
        ) : (
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Legend layout="horizontal" verticalAlign="top" align="center" wrapperStyle={{paddingBottom: "1rem"}}/>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
