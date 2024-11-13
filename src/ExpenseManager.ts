import { Category, Expense, IExpenseManager, ExpenseSummary } from './types';

export class ExpenseManager implements IExpenseManager {
    private expenses: Expense[] = [];
    private groupedExpenses: Map<Category, ExpenseSummary> | null = null;

    // Метод для добавления нового расхода
    addExpense(expense: Expense): void {
        this.expenses.push(expense);
        this.saveExpenses(); // сохраняем расходы в localStorage
        this.update(); // рендерим список
    }

    // сохранене расходов в localStorage
    private saveExpenses(): void {
        // Преобразуем массив расходов в строку JSON и сохраняем в localStorage
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
    }

    // Метод для загрузки расходов из localStorage
    loadExpenses(): void {
        const savedExpenses = localStorage.getItem('expenses');
        if (savedExpenses) {
            this.expenses = JSON.parse(savedExpenses);
        }
        this.update(); // рендерим интерфейс с текущими расходами
    }

    // фильтрация по дате
    filterByDate(date: string): void {
        const filteredExpenses = this.expenses.filter(exp => exp.date === date);
        this.renderExpenses(filteredExpenses); // отрисовка по дате
    }

    // для сброса фильтра по дате
    resetFilter(): void {
        this.update();
    }

    // Метод группировки расходов по категориям
    groupByCategory(): Map<Category, ExpenseSummary> {
        const groupedMap = new Map<Category, ExpenseSummary>();

        // Группировка расходов по категориям
        this.expenses.forEach(expense => {
            const category = expense.category;
            const summary = groupedMap.get(category) || {
                total: 0,
                count: 0,
                expenses: [],
            };

            summary.total += expense.amount; // Обновляем общую сумму по категории
            summary.expenses.push(expense); //Добавляем текущий расход в массив
            groupedMap.set(category, summary);
        });
        this.groupedExpenses = groupedMap; // Сохраняем сгруппированные расходы
        return groupedMap;
    }

    // Получение сгруппированных расходов
    getGrouped(): Map<Category, ExpenseSummary> | null {
        return this.groupedExpenses;
    }

    // Отрисовка сгруппированных расходов по категориям
    renderGroupedExpenses(): void {
        const groupedContainer = document.getElementById('grouped-expenses')!;
        groupedContainer.innerHTML = ''; // Очищаем контейнер перед рендерингом

        if (!this.groupedExpenses) return; // Если группировка еще не выполнена, выходим

        const groupedMap = this.groupedExpenses;

        // Проходим по каждой категории и создаем блок с данными
        groupedMap.forEach((summary, category) => {
            const categoryBlock = `
            <div class="category-block">
                <h4>${category}</h4>
                <!-- Таблица с расходами по этой категории -->
                <table class="expense-table">
                    <thead>
                        <tr>
                            <th>Категория</th>
                            <th>Сумма</th>
                            <th>Дата</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${summary.expenses.map(exp => `
                            <tr>
                                <td>${exp.category}</td>
                                <td>${exp.amount.toFixed(2)} руб.</td>
                                <td>${exp.date}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <!--------------->
                <p>Общие затраты по категории за все время: ${summary.total.toFixed(2)} руб.</p>
            </div>`;

            // Добавляем блок с категорией и ее отчетами в контейнер
            groupedContainer.insertAdjacentHTML('beforeend', categoryBlock);
        });
    }

    // Общая сумма расходов
    calculateTotal(): number {
        return this.expenses.reduce((total, expense) => total + expense.amount, 0);
    }

    // Средние расходы за день
    calculateAverage(expenses: Expense[] = this.expenses): number {
        const uniqueDates = new Set(expenses.map(exp => exp.date));
        return uniqueDates.size ? this.calculateTotal() / uniqueDates.size : 0;
    }

    // Средние расходы за неделю
    calculateWeekly(expenses: Expense[] = this.expenses): number {
        return this.calculateTotal() / 4; // Упрощенно: считаем, что месяц = 4 недели
    }

    // Средние расходы за месяц
    calculateMonthly(expenses: Expense[] = this.expenses): number {
        return this.calculateTotal() / 12;
    }

    // Средние расходы за год
    calculateYearly(expenses: Expense[] = this.expenses): number {
        return this.calculateTotal();
    }

    // Обновление итогов на интерфейсе
    updateSummary(): void {
        const totalElement = document.getElementById('total-all-time')!;
        totalElement.textContent = this.calculateTotal().toString();

        const averageElement = document.getElementById('average-expense')!;
        averageElement.textContent = this.calculateAverage().toString();

        const weeklyElement = document.getElementById('weekly-expense')!;
        weeklyElement.textContent = this.calculateWeekly().toString();

        const monthlyElement = document.getElementById('monthly-expense')!;
        monthlyElement.textContent = this.calculateMonthly().toString();

        const yearlyElement = document.getElementById('year-expense')!;
        yearlyElement.textContent = this.calculateYearly().toString();
    }

    // Метод для обновления списка расходов и отчета
    update(): void {
        this.renderExpenses(this.expenses); // обновление списка
        this.updateSummary(); // обновление отчета
    }

    // Отрисовка расходов
     renderExpenses(expenses: Expense[]): void {
        const expenseTable = document.getElementById('expense-table')!;
        expenseTable.innerHTML = '';

        // Проверяем, если нет расходов
        if (expenses.length === 0) {
            expenseTable.innerHTML = '<tr><td colspan="4">Нет расходов</td></tr>';
            return;
        }

        // Отрисовка всех расходов
         expenses.forEach((expense, index) => {
            const row = document.createElement('tr');

            // Ячейки для категории, суммы и даты
            row.innerHTML = `
            <td>${expense.category}</td>
            <td>${expense.amount.toFixed(2)} руб.</td>
            <td>${expense.date}</td>
            <td><button class="delete-btn" data-index="${index}">Удалить</button></td>
        `;

            expenseTable.appendChild(row);
        });

        // Привязываем обработчики событий для всех кнопок удаления
        this.addDeleteBtnHandlers();
    }

    private addDeleteBtnHandlers(): void {
        // Получаем все кнопки с классом "delete-btn"
        const deleteButtons = document.querySelectorAll('.delete-btn');

        // Привязываем обработчик для каждой кнопки
        deleteButtons.forEach(btn => {
            btn.removeEventListener('click', this.handleDelete); // Убираем предыдущий обработчик, если он есть
            btn.addEventListener('click', this.handleDelete.bind(this));
        });
    }

    // Обработчик удаления
    private handleDelete(event: Event): void {
        const target = event.target as HTMLButtonElement;
        const index = target.dataset.index;
        if (index !== undefined) {
            this.removeExpense(parseInt(index));
        }
    }

    // удаление расхода
    removeExpense(index: number): void {
        this.expenses.splice(index, 1);
        this.saveExpenses(); // Сохраняем обновленный список расходов
        this.update();
    }
}