import { ExpenseManager } from './ExpenseManager';
import { Expense, Category } from './types';

const manager = new ExpenseManager();

// добавление нового расхода
const expenseForm = document.getElementById('expense-form') as HTMLFormElement;
expenseForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const category = (document.getElementById('category') as HTMLSelectElement).value as Category;
    const amount = parseFloat((document.getElementById('amount') as HTMLInputElement).value);
    const date = (document.getElementById('date') as HTMLInputElement).value;

    const expense: Expense = { category, amount, date };
    manager.addExpense(expense);
});

// Обработчик фильтрации по дате
const filterBtn = document.getElementById('filter-btn')!;
filterBtn.addEventListener('click', () => {
    const filterDate = (document.getElementById('filter-date') as HTMLInputElement).value;
    manager.filterByDate(filterDate);
});

// Обработчик для сброса фильтра по дате
const resetFilterBtn = document.getElementById('reset-filter-btn')!;
resetFilterBtn.addEventListener('click', () => {
    manager.resetFilter();
});

// Обработчик группировки по категориям
const groupBtn = document.getElementById('group-btn')!;
groupBtn.addEventListener('click', () => {
    const grouped = manager.groupByCategory();
    const groupedContainer = document.getElementById('grouped-expenses');

    if (groupedContainer) {
        manager.renderGroupedExpenses (groupedContainer, grouped)
    }
});



manager.loadExpenses() //загрузка и рендеринг из LS