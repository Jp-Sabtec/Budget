import { BudgetState, TaxDetails, Expense } from "@/types";
import * as XLSX from 'xlsx';

// JSON Handlers
export const exportToJSON = (data: BudgetState) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "tracksoft-budget.json";
    link.click();
};

export const importFromJSON = (
    file: File, 
    onSuccess: (data: BudgetState) => void,
    onError: (error: string) => void
) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') {
                throw new Error("File content is not valid text.");
            }
            const data = JSON.parse(text);
            // Basic validation
            if (data.monthlySalary !== undefined && data.expenses !== undefined && data.currency !== undefined) {
                 onSuccess(data as BudgetState);
            } else {
                throw new Error("Invalid JSON structure for budget data.");
            }
        } catch (error) {
            onError(error instanceof Error ? error.message : "Failed to parse JSON file.");
        }
    };
    reader.onerror = () => onError("Failed to read the file.");
    reader.readAsText(file);
};


// Excel Handlers
export const exportToExcel = (budget: BudgetState, taxDetails: TaxDetails | null) => {
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
        ["TrackSoft Budget Summary"],
        [],
        ["Currency", budget.currency],
        ["Monthly Salary (Gross)", budget.monthlySalary],
        ["Monthly Tax", taxDetails?.monthlyTax || 0],
        ["Monthly Net Income", taxDetails?.netMonthly || 0],
        ["Total Expenses", budget.expenses.reduce((acc, e) => acc + e.amount, 0)],
        ["Remaining Balance", (taxDetails?.netMonthly || 0) - budget.expenses.reduce((acc, e) => acc + e.amount, 0)],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    // Expenses Sheet
    const expensesData = budget.expenses.map(e => ({
        Category: e.category === 'Other' ? e.customName : e.category,
        Amount: e.amount
    }));
    const wsExpenses = XLSX.utils.json_to_sheet(expensesData);
    XLSX.utils.book_append_sheet(wb, wsExpenses, "Expenses");

    // Create a hidden sheet for raw data to re-import
    const rawData = {
        monthlySalary: budget.monthlySalary,
        currency: budget.currency,
        expenses: budget.expenses
    };
    const wsRaw = XLSX.utils.json_to_sheet([rawData]);
    XLSX.utils.book_append_sheet(wb, wsRaw, "RawData");
    // Hide the sheet
    if (!wb.Workbook) wb.Workbook = {};
    if (!wb.Workbook.Sheets) wb.Workbook.Sheets = [];
    wb.Workbook.Sheets.push({ Name: "RawData", Hidden: 1 });


    XLSX.writeFile(wb, "tracksoft-budget.xlsx");
};

export const importFromExcel = (
    file: File, 
    onSuccess: (data: BudgetState) => void,
    onError: (error: string) => void
) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'array' });

            const rawSheetName = workbook.SheetNames.find(name => name === "RawData");
            if (!rawSheetName) {
                // Fallback for simple expense list import
                const expensesSheetName = workbook.SheetNames.find(name => name.toLowerCase() === "expenses") || workbook.SheetNames[0];
                if(!expensesSheetName) throw new Error("No valid sheet found in Excel file.");
                
                const worksheet = workbook.Sheets[expensesSheetName];
                const expensesJSON = XLSX.utils.sheet_to_json<any>(worksheet);

                const expenses: Expense[] = expensesJSON.map((row, index) => ({
                    id: `imported-${index}-${new Date().getTime()}`,
                    category: 'Other',
                    customName: row.Category || row.category || 'Imported Expense',
                    amount: parseFloat(row.Amount || row.amount || 0),
                }));

                const fallbackState: BudgetState = {
                    monthlySalary: 0,
                    currency: 'ZAR',
                    expenses,
                };
                onSuccess(fallbackState);
                return;
            }

            const rawWorksheet = workbook.Sheets[rawSheetName];
            const rawDataJson = XLSX.utils.sheet_to_json<BudgetState>(rawWorksheet);
            
            if (rawDataJson.length > 0 && rawDataJson[0]) {
                const importedState = rawDataJson[0];
                // Excel import might stringify the expenses array
                if (typeof importedState.expenses === 'string') {
                    importedState.expenses = JSON.parse(importedState.expenses);
                }
                onSuccess(importedState);
            } else {
                throw new Error("RawData sheet is empty or invalid.");
            }

        } catch (error) {
            onError(error instanceof Error ? error.message : "Failed to parse Excel file.");
        }
    };
    reader.onerror = () => onError("Failed to read the file.");
    reader.readAsArrayBuffer(file);
};
