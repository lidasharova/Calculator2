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

    // загрузка данных из LS
     loadExpenses(): void {
        try {
            const savedExpenses = localStorage.getItem('expenses');
            if (savedExpenses) {
                const parsedExpenses = JSON.parse(savedExpenses);
                // Проверяем, что это массив и каждый элемент имеет нужную структуру
                if (Array.isArray(parsedExpenses) && this.validateExpenses(parsedExpenses)) {
                    this.expenses = parsedExpenses;
                } else {
                    console.log('Некорректные данные в localStorage.');
                    this.expenses = []; // значение по умолчанию
                }
            } else {
                this.expenses = []; // Если данных нет, устанавливаем значение по умолчанию
            }
        } catch {
            console.log('Не удалось загрузить данные из localStorage');
            this.expenses = []; // Устанавливаем значение по умолчанию в случае ошибки
        }
        this.update(); // рендерим интерфейс с текущими расходами
    }

    // проверка структуры каждого объекта в массиве данных для защиты от порчи
    private validateExpenses(expenses: any[]): boolean {
        return expenses.every(expense =>
            typeof expense === 'object' &&
            expense !== null &&
            typeof expense.category === 'string' &&
            typeof expense.amount === 'number' &&
            typeof expense.date === 'string' &&
            !isNaN(Date.parse(expense.date))
        );
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

    // группируем расходы по категориям
    groupByCategory(): Map<Category, ExpenseSummary> {
        const groupedMap = new Map<Category, ExpenseSummary>();

        // Группировка расходов по категориям
        this.expenses.forEach(expense => {
            const category = expense.category;
            const summary = groupedMap.get(category) || {
                total: 0, // общая сумма
                expenses: [], // расходы в категории
            };

            summary.total += expense.amount; // обновляем общую сумму по категории
            summary.expenses.push(expense); //добавляем текущий расход в массив
            groupedMap.set(category, summary);
        });
        this.groupedExpenses = groupedMap; // Сохраняем сгруппированные расходы
        return groupedMap;
    }

    // Получение сгруппированных расходов
    getGrouped(): Map<Category, ExpenseSummary> | null {
        return this.groupedExpenses;
    }

    // рендеринг сгруппированных расходов
    renderGroupedExpenses(container: HTMLElement , grouped: Map<Category, ExpenseSummary>) {
        container.innerHTML = ''; // очистка контейнера
        grouped.forEach((summary, category) => {
            // шапка группировки
            let categoryBlock = `
                <div class="category-group">
                    <h4>${category}</h4>
                    <table class="expenses-table">
                        <thead>
                            <tr>
                                <th>Категория</th>
                                <th>Сумма</th>
                                <th>Дата</th>
                            </tr>
                        </thead>
                        <tbody>
                        `;

            // список расходов
            summary.expenses.forEach(expense => {
                categoryBlock += `
                    <tr>
                        <td>${expense.category}</td>
                        <td>${expense.amount} руб.</td>
                        <td>${expense.date}</td>
                    </tr>
                `;
            });

            // итоговая сумма по категориям
            categoryBlock += `
                        </tbody>
                    </table>
                    <div class="summary">
                        <p>Общие затраты: ${summary.total} руб.</p>
                    </div>
                </div>
            `;

            // Добавляем блок категории в контейнер
            container.insertAdjacentHTML('beforeend', categoryBlock);
        });
    }

    // Общая сумма расходов
    calculateTotal(): number {
        const total = this.expenses.reduce((total, expense) => total + expense.amount, 0);
        return parseFloat(total.toFixed(2)); // Округляем до 2 знаков после запятой
    }

    // Средние расходы за день
    calculateAverage(expenses: Expense[] = this.expenses): number {
        const uniqueDates = new Set(expenses.map(exp => exp.date));
        const average = uniqueDates.size ? this.calculateTotal() / uniqueDates.size : 0;
        return parseFloat(average.toFixed(2));
    }

    // Средние расходы за неделю
    calculateWeekly(expenses: Expense[] = this.expenses): number {
        const weekly = this.calculateTotal() / 4;
        return parseFloat(weekly.toFixed(2));
    }

    // Средние расходы за месяц
    calculateMonthly(expenses: Expense[] = this.expenses): number {
        const monthly = this.calculateTotal() / 12;
        return parseFloat(monthly.toFixed(2));
    }

    // Средние расходы за год
    calculateYearly(expenses: Expense[] = this.expenses): number {
        const yearly = this.calculateTotal();
        return parseFloat(yearly.toFixed(2));
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

    // обработчик удаления
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