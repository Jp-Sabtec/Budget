"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Currency, Expense, ExpenseCategory, EXPENSE_CATEGORIES } from '@/types';
import { CURRENCIES } from '@/lib/currency';

const formSchema = z.object({
  category: z.custom<ExpenseCategory>(),
  customName: z.string().optional(),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0."),
}).refine(data => {
    if (data.category === 'Other') {
        return !!data.customName && data.customName.trim().length > 0;
    }
    return true;
}, {
    message: "Custom name is required for 'Other' category.",
    path: ["customName"],
});


interface ExpenseFormProps {
    onSubmit: (expense: Omit<Expense, 'id'>) => void;
    currency: Currency;
}

export default function ExpenseForm({ onSubmit, currency }: ExpenseFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: 'Food',
      amount: 0,
    },
  });

  const currencySymbol = CURRENCIES[currency].symbol;
  const selectedCategory = form.watch('category');

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    const amountInSelectedCurrency = values.amount;
    const amountInZAR = amountInSelectedCurrency / CURRENCIES[currency].rate;
    
    onSubmit({
        category: values.category,
        customName: values.category === 'Other' ? values.customName : undefined,
        amount: amountInZAR
    });
    form.reset({ category: 'Food', amount: 0, customName: '' });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an expense category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedCategory === 'Other' && (
              <FormField
                control={form.control}
                name="customName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Subscriptions" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">{currencySymbol}</span>
                        <Input type="number" placeholder="0.00" {...field} className="pl-7" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Add Expense</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
