export type Category = 'еда' | 'транспорт' | 'развлечения' | 'другое';

export interface Expense {
    category: Category;
    amount: number;
    date: string;
}

export interface IExpenseManager {
    expenses: Expense[];
    addExpense(expense: Expense): void;
    deleteExpense(index: number): void;
    filterExpensesByDate(date: string): Expense[];
    groupExpensesByCategory(): Map<Category, number>;
    getTotalExpense(): number;
    getAverageExpense(): number;
    getAverageExpenseByPeriod(period: 'day' | 'month' | 'year'): number;
    renderExpenses(): void;
    renderGroupedExpenses(): void;
    updateSummary(): void;
}