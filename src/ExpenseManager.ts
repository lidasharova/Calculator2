import { Expense, IExpenseManager, Category } from './types';

export class ExpenseManager implements IExpenseManager {
    expenses: Expense[] = [];

    constructor() {
        this.loadExpenses();
        this.renderExpenses();
        this.updateSummary();
    }

    // Добавление нового расхода
    addExpense(expense: Expense): void {
        this.expenses.push(expense);
        this.saveExpenses();
        this.renderExpenses();
        this.updateSummary();
    }

    // Удаление расхода по индексу
    deleteExpense(index: number): void {
        this.expenses.splice(index, 1);
        this.saveExpenses();
        this.renderExpenses();
        this.updateSummary();
    }

    // Фильтрация по дате
    filterExpensesByDate(date: string): Expense[] {
        return this.expenses.filter(exp => exp.date === date);
    }

    // Группировка по категориям
    groupExpensesByCategory(): Map<Category, number> {
        const grouped = new Map<Category, number>();
        this.expenses.forEach(exp => {
            const currentTotal = grouped.get(exp.category) || 0;
            grouped.set(exp.category, currentTotal + exp.amount);
        });
        return grouped;
    }

    // Расчет общих и средних расходов
    getTotalExpense(): number {
        return this.expenses.reduce((acc, exp) => acc + exp.amount, 0);
    }

    getAverageExpense(): number {
        if (this.expenses.length === 0) return 0;
        return this.getTotalExpense() / this.expenses.length;
    }

    getAverageExpenseByPeriod(period: 'day' | 'month' | 'year'): number {
        const currentDate = new Date();
        let filteredExpenses: Expense[];

        if (period === 'day') {
            filteredExpenses = this.expenses.filter(exp => new Date(exp.date).toDateString() === currentDate.toDateString());
        } else if (period === 'month') {
            filteredExpenses = this.expenses.filter(exp => {
                const expDate = new Date(exp.date);
                return expDate.getMonth() === currentDate.getMonth() && expDate.getFullYear() === currentDate.getFullYear();
            });
        } else {
            filteredExpenses = this.expenses.filter(exp => new Date(exp.date).getFullYear() === currentDate.getFullYear());
        }

        const total = filteredExpenses.reduce((acc, exp) => acc + exp.amount, 0);
        return filteredExpenses.length ? total / filteredExpenses.length : 0;
    }

    // Сохранение в localStorage
    saveExpenses(): void {
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
    }

    // Загрузка из localStorage
    loadExpenses(): void {
        const data = localStorage.getItem('expenses');
        if (data) this.expenses = JSON.parse(data);
    }

    // Отображение расходов
    renderExpenses(): void {
        const tableBody = document.getElementById('expense-table')!;
        tableBody.innerHTML = '';

        this.expenses.forEach((exp, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${exp.category}</td>
                <td>${exp.amount} руб.</td>
                <td>${exp.date}</td>
                <td><button onclick="expenseManager.deleteExpense(${index})">Удалить</button></td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Обновление отчетов
    updateSummary(): void {
        document.getElementById('total-expense')!.textContent = this.getTotalExpense().toString();
        document.getElementById('average-expense')!.textContent = this.getAverageExpense().toFixed(2);
        document.getElementById('monthly-expense')!.textContent = this.getAverageExpenseByPeriod('month').toFixed(2);
        document.getElementById('yearly-expense')!.textContent = this.getAverageExpenseByPeriod('year').toFixed(2);
    }

    // Отображение группировки по категориям
    renderGroupedExpenses(): void {
        const groupedList = document.getElementById('grouped-expenses')!;
        groupedList.innerHTML = '';

        const grouped = this.groupExpensesByCategory();
        grouped.forEach((total, category) => {
            const item = document.createElement('li');
            item.textContent = `${category}: ${total} руб.`;
            groupedList.appendChild(item);
        });
    }
}