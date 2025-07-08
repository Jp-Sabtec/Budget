"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { BudgetState, Currency, Expense, TaxDetails } from '@/types';
import { calculateSATax } from '@/lib/tax';
import { CURRENCIES } from '@/lib/currency';
import { exportToJSON, importFromJSON, exportToExcel, importFromExcel } from '@/lib/fileHandlers';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import AppHeader from './AppHeader';
import IncomeCard from './IncomeCard';
import BudgetSummary from './BudgetSummary';
import ExpenseForm from './ExpenseForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExpenseTable from './ExpenseTable';
import SpendingChart from './SpendingChart';
import { useToast } from "@/hooks/use-toast";
import BudgetReview from './BudgetReview';

const initialBudget: BudgetState = {
  monthlySalary: 0,
  expenses: [],
  currency: 'ZAR',
};

export default function TaxWiseDashboard() {
  const [budget, setBudget] = useState<BudgetState>(initialBudget);
  const [activeTab, setActiveTab] = useState('create');
  const { toast } = useToast();

  const taxDetails: TaxDetails | null = useMemo(() => {
    if (budget.monthlySalary > 0) {
      return calculateSATax(budget.monthlySalary);
    }
    return null;
  }, [budget.monthlySalary]);

  const totalExpenses = useMemo(() => {
    return budget.expenses.reduce((acc, expense) => acc + expense.amount, 0);
  }, [budget.expenses]);

  const netMonthlyIncome = taxDetails?.netMonthly || 0;
  const remainingBalance = netMonthlyIncome - totalExpenses;

  const handleStateChange = useCallback((newState: Partial<BudgetState>) => {
    setBudget(prev => ({...prev, ...newState}));
  }, []);

  const addExpense = (newExpense: Omit<Expense, 'id'>) => {
    setBudget(prev => ({
      ...prev,
      expenses: [...prev.expenses, { ...newExpense, id: new Date().toISOString() }],
    }));
  };

  const deleteExpense = (id: string) => {
    setBudget(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id),
    }));
  };
  
  const handleFileUpload = (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    const onImportSuccess = (data: BudgetState) => {
        setBudget(data);
        toast({
          title: "Import Successful",
          description: "Your budget data has been loaded.",
        });
    };

    const onImportError = (error: string) => {
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: error,
        });
    };
    
    if (fileExtension === 'json') {
      importFromJSON(file, onImportSuccess, onImportError);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      importFromExcel(file, onImportSuccess, onImportError);
    } else {
      toast({
        variant: "destructive",
        title: "Unsupported File Type",
        description: "Please upload a .json or .xlsx file.",
      });
    }
  };

  const handleExportPDF = () => {
    const elementId = activeTab === 'create' ? 'pdf-content' : 'pdf-review-content';
    const input = document.getElementById(elementId);
    if (input) {
      toast({
        title: 'Generating PDF...',
        description: 'Please wait a moment while we prepare your document.',
      });
      html2canvas(input, {
        scale: 2,
        useCORS: true,
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgProps= pdf.getImageProperties(imgData);
        const imgWidth = imgProps.width;
        const imgHeight = imgProps.height;
        
        const ratio = imgWidth / imgHeight;
        
        let newWidth = pdfWidth - 20; // with margin
        let newHeight = newWidth / ratio;

        if(newHeight > pdfHeight - 20) {
            newHeight = pdfHeight - 20;
            newWidth = newHeight * ratio;
        }

        const x = (pdfWidth - newWidth) / 2;
        const y = (pdfHeight - newHeight) / 2;
        
        const fileName = activeTab === 'create' ? 'tracksoft-budget.pdf' : 'tracksoft-budget-review.pdf';
        pdf.addImage(imgData, 'PNG', x, y, newWidth, newHeight);
        pdf.save(fileName);

        toast({
          title: 'PDF Exported',
          description: 'Your budget has been successfully exported.',
        });
      });
    } else {
        const errorMessage = activeTab === 'review'
            ? "Please import a budget to review before exporting to PDF."
            : "Could not find content to export.";
        toast({
            variant: "destructive",
            title: "Export Failed",
            description: errorMessage,
        });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader
        currency={budget.currency}
        onCurrencyChange={(newCurrency) => handleStateChange({ currency: newCurrency as Currency })}
        onSaveJSON={() => exportToJSON(budget)}
        onSaveExcel={() => exportToExcel(budget, taxDetails)}
        onFileUpload={handleFileUpload}
        onSavePDF={handleExportPDF}
      />
      <main className="flex-grow p-4 md:p-8">
        <Tabs defaultValue="create" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6 max-w-lg mx-auto">
                <TabsTrigger value="create">Create Monthly Budget</TabsTrigger>
                <TabsTrigger value="review">Review Monthly Budget</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
                <div id="pdf-content" className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <IncomeCard
                        salary={budget.monthlySalary}
                        onSalaryChange={(salary) => handleStateChange({ monthlySalary: salary })}
                        taxDetails={taxDetails}
                        currency={budget.currency}
                        />
                        <BudgetSummary
                        netIncome={netMonthlyIncome}
                        totalExpenses={totalExpenses}
                        remainingBalance={remainingBalance}
                        currency={budget.currency}
                        />
                        <ExpenseForm onSubmit={addExpense} currency={budget.currency} />
                    </div>
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="list" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="list">Expense List</TabsTrigger>
                            <TabsTrigger value="breakdown">Spending Breakdown</TabsTrigger>
                        </TabsList>
                        <TabsContent value="list">
                            <ExpenseTable expenses={budget.expenses} currency={budget.currency} onDelete={deleteExpense} />
                        </TabsContent>
                        <TabsContent value="breakdown">
                            <SpendingChart expenses={budget.expenses} currency={budget.currency} />
                        </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="review">
                <BudgetReview />
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
