export type Category = 'еда' | 'транспорт' | 'развлечения' | 'другое';

export interface Expense {
    category: Category;
    amount: number;
    date: string;
}

export interface IExpenseManager {
    addExpense(expenses: Expense): void;
    removeExpense(index: number): void;
    filterByDate(date: string): void;
    groupByCategory(): Map<Category, ExpenseSummary>;
    getGrouped(): Map<Category, ExpenseSummary> | null;
    calculateTotal(): number;
    calculateWeekly(): number;
    calculateMonthly(): number;
    calculateYearly(): number;
    calculateAverage(): number;
    renderExpenses(expenses: Expense[]): void;
    updateSummary(): void; // расчет
    update(): void; // отрисовка
    renderGroupedExpenses(): void; //отрисовка сгруппированных трат по группам
    loadExpenses(): void;
}

export interface ExpenseSummary {
    total: number; // Общая сумма
    dailyAvg?: number; // Среднее за день
    weeklyAvg?: number; // Среднее за неделю
    monthlyAvg?: number; // Среднее за месяц
    yearlyAvg?: number; // Среднее за год
    count: number; // Количество расходов в категории
    expenses: Expense[]; // Массив расходов для категории
}