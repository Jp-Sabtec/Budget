"use client";

import React, { useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileJson, FileSpreadsheet, Calculator, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Currency } from '@/types';
import { CURRENCIES } from '@/lib/currency';

interface AppHeaderProps {
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  onSaveJSON: () => void;
  onSaveExcel: () => void;
  onFileUpload: (file: File) => void;
  onSavePDF: () => void;
}

export default function AppHeader({
  currency,
  onCurrencyChange,
  onSaveJSON,
  onSaveExcel,
  onFileUpload,
  onSavePDF,
}: AppHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    // Reset file input to allow re-uploading the same file
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Calculator className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            TaxWise <span className="hidden sm:inline-block">Budget</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Select value={currency} onValueChange={onCurrencyChange}>
            <SelectTrigger className="w-24 md:w-28" aria-label="Select Currency">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(CURRENCIES).map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".json,.xlsx,.xls"
          />
          <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            <span className="sr-only">Import Data</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
                <span className="sr-only">Export Data</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onSaveJSON}>
                <FileJson className="mr-2 h-4 w-4" />
                <span>Export as JSON</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSaveExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                <span>Export as Excel</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSavePDF}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Export as PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
}
