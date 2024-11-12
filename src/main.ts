import { ExpenseManager } from './ExpenseManager';
import { Category } from './types';

const expenseManager = new ExpenseManager();

// Обработка формы добавления расходов
document.getElementById('expense-form')!.addEventListener('submit', (event) => {
    event.preventDefault();
    const category = (document.getElementById('category') as HTMLSelectElement).value as Category;
    const amount = +(document.getElementById('amount') as HTMLInputElement).value;
    const date = (document.getElementById('date') as HTMLInputElement).value;

    if (category && amount > 0 && date) {
        expenseManager.addExpense({ category, amount, date });
    }
});

// Фильтрация по дате
document.getElementById('filter-btn')!.addEventListener('click', () => {
    const date = (document.getElementById('filter-date') as HTMLInputElement).value;
    const filtered = expenseManager.filterExpensesByDate(date);
    expenseManager.renderExpenses();
});

// Группировка по категориям
document.getElementById('group-btn')!.addEventListener('click', () => {
    expenseManager.renderGroupedExpenses();
});
