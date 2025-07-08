"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Currency, Expense } from '@/types';
import { CURRENCIES } from '@/lib/currency';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { PlusCircle } from 'lucide-react';

const formSchema = z.object({
  category: z.string().min(1, "Category is required."),
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
    categories: string[];
    onAddCategory: (category: string) => void;
}

export default function ExpenseForm({ onSubmit, currency, categories, onAddCategory }: ExpenseFormProps) {
  const [newCategory, setNewCategory] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: categories[0] || '',
      amount: 0,
      customName: '',
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
    form.reset({ category: categories[0] || '', amount: 0, customName: '' });
  }

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      onAddCategory(newCategory.trim());
      form.setValue('category', newCategory.trim());
      setNewCategory('');
      setIsDialogOpen(false);
    }
  };

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
                  <div className="flex items-center gap-2">
                    <Select onValueChange={field.onChange} value={field.value || ''} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an expense category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="shrink-0">
                          <PlusCircle className="h-4 w-4" />
                          <span className="sr-only">Add new category</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Category</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <Input 
                            placeholder="e.g., Entertainment"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                          />
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="ghost">Cancel</Button>
                          </DialogClose>
                          <Button onClick={handleAddCategory}>Add Category</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
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
