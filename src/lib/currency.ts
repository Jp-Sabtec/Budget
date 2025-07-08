import { Currency } from "@/types";

type CurrencyDetails = {
    symbol: string;
    rate: number; // Rate relative to ZAR
};

export const CURRENCIES: Record<Currency, CurrencyDetails> = {
    ZAR: { symbol: 'R', rate: 1 },
    USD: { symbol: '$', rate: 1 / 18.5 }, // Example rate, 1 USD = 18.5 ZAR
    EUR: { symbol: '€', rate: 1 / 20.0 }, // Example rate, 1 EUR = 20.0 ZAR
};

export function convertToSelectedCurrency(amountInZAR: number, targetCurrency: Currency): number {
    return amountInZAR * CURRENCIES[targetCurrency].rate;
}

export function formatCurrency(amount: number, currency: Currency): string {
    const symbol = CURRENCIES[currency].symbol;
    const formattedAmount = amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `${symbol} ${formattedAmount}`;
}
