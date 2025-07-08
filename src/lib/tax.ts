import { TaxDetails } from "@/types";

// 2024/2025 Tax Brackets (1 March 2024 - 28 February 2025)
const taxBrackets = [
    { threshold: 0, rate: 0.18, base: 0 },
    { threshold: 237100, rate: 0.26, base: 42678 },
    { threshold: 370500, rate: 0.31, base: 77362 },
    { threshold: 512800, rate: 0.36, base: 121475 },
    { threshold: 673000, rate: 0.39, base: 179147 },
    { threshold: 857900, rate: 0.41, base: 251258 },
    { threshold: 1817000, rate: 0.45, base: 644489 },
];

// 2024/2025 Rebates
const primaryRebate = 17235;
// For simplicity, we are not including secondary/tertiary rebates for age.

export function calculateSATax(monthlySalary: number): TaxDetails {
    const grossAnnual = monthlySalary * 12;
    const taxableIncome = grossAnnual;

    let annualTax = 0;

    const bracket = taxBrackets.slice().reverse().find(b => taxableIncome >= b.threshold);

    if (bracket) {
        annualTax = bracket.base + (taxableIncome - bracket.threshold) * bracket.rate;
    }
    
    const taxAfterRebate = Math.max(0, annualTax - primaryRebate);
    const monthlyTax = taxAfterRebate / 12;
    const netMonthly = monthlySalary - monthlyTax;

    return {
        grossAnnual,
        taxableIncome,
        annualTax: taxAfterRebate,
        monthlyTax,
        netMonthly,
    };
}
