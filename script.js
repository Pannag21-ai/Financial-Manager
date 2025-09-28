// Finance Manager JavaScript

// Categories for income and expenses
const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'],
    expense: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Other']
};

// Global variables
let transactions = [];
let charts = {};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadTransactions();
    initializeEventListeners();
    updateDashboard();
    populateCategories();
    setDefaultDate();
    
    // Add some sample data if no transactions exist
    if (transactions.length === 0) {
        addSampleData();
    }
});

// Load transactions from localStorage
function loadTransactions() {
    try {
        const stored = localStorage.getItem('financeTransactions');
        if (stored) {
            transactions = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading transactions:', error);
        transactions = [];
    }
}

// Save transactions to localStorage
function saveTransactions() {
    try {
        localStorage.setItem('financeTransactions', JSON.stringify(transactions));
    } catch (error) {
        console.error('Error saving transactions:', error);
        showNotification('Error saving data', 'error');
    }
}

// Add sample data for demonstration
function addSampleData() {
    const sampleTransactions = [
        {
            id: Date.now() + 1,
            amount: 3500,
            type: 'income',
            category: 'Salary',
            description: 'Monthly Salary',
            date: new Date().toISOString().split('T')[0]
        },
        {
            id: Date.now() + 2,
            amount: 500,
            type: 'income',
            category: 'Freelance',
            description: 'Website Project',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
        },
        {
            id: Date.now() + 3,
            amount: 1200,
            type: 'expense',
            category: 'Rent',
            description: 'Monthly Rent',
            date: new Date(Date.now() - 172800000).toISOString().split('T')[0]
        },
        {
            id: Date.now() + 4,
            amount: 300,
            type: 'expense',
            category: 'Food',
            description: 'Groceries',
            date: new Date(Date.now() - 259200000).toISOString().split('T')[0]
        },
        {
            id: Date.now() + 5,
            amount: 150,
            type: 'expense',
            category: 'Transport',
            description: 'Gas & Transportation',
            date: new Date(Date.now() - 345600000).toISOString().split('T')[0]
        }
    ];
    
    transactions = sampleTransactions;
    saveTransactions();
}

// Initialize event listeners
function initializeEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            showView(view);
        });
    });

    // Quick add form
    document.getElementById('quickAddForm').addEventListener('submit', handleQuickAdd);

    // Transaction form
    document.getElementById('transactionForm').addEventListener('submit', handleTransactionSubmit);

    // Add transaction button
    document.getElementById('addTransactionBtn').addEventListener('click', openAddModal);

    // Modal close
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });

    // Type change handlers
    document.getElementById('type').addEventListener('change', updateCategoryOptions);
    document.getElementById('quickType').addEventListener('change', updateQuickCategoryOptions);

    // Filters
    document.getElementById('filterType').addEventListener('change', filterTransactions);
    document.getElementById('filterCategory').addEventListener('change', filterTransactions);
    document.getElementById('filterMonth').addEventListener('change', filterTransactions);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);

    // Export
    document.getElementById('exportCSV').addEventListener('click', exportToCSV);
}

// Show specific view
function showView(viewName) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewName).classList.add('active');

    // Update content based on view
    if (viewName === 'dashboard') {
        updateDashboard();
    } else if (viewName === 'transactions') {
        displayTransactions();
    } else if (viewName === 'reports') {
        updateReports();
    }
}

// Populate category dropdowns
function populateCategories() {
    updateCategoryOptions();
    updateQuickCategoryOptions();
    updateFilterCategories();
}

// Update category options based on type
function updateCategoryOptions() {
    const type = document.getElementById('type').value;
    const categorySelect = document.getElementById('category');
    
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    if (type && categories[type]) {
        categories[type].forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
    }
}

// Update quick add category options
function updateQuickCategoryOptions() {
    const type = document.getElementById('quickType').value;
    const categorySelect = document.getElementById('quickCategory');
    
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    if (type && categories[type]) {
        categories[type].forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
    }
}

// Update filter categories
function updateFilterCategories() {
    const filterCategory = document.getElementById('filterCategory');
    filterCategory.innerHTML = '<option value="">All Categories</option>';
    
    const allCategories = [...categories.income, ...categories.expense];
    allCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        filterCategory.appendChild(option);
    });
}

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

// Handle quick add transaction
function handleQuickAdd(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('quickAmount').value);
    const type = document.getElementById('quickType').value;
    const category = document.getElementById('quickCategory').value;
    const description = document.getElementById('quickDescription').value;
    const date = new Date().toISOString().split('T')[0];
    
    if (amount && type && category && description) {
        const transaction = {
            id: Date.now(),
            amount: amount,
            type: type,
            category: category,
            description: description,
            date: date
        };
        
        transactions.unshift(transaction);
        saveTransactions();
        updateDashboard();
        
        // Reset form
        document.getElementById('quickAddForm').reset();
        showNotification('Transaction added successfully', 'success');
    }
}

// Handle transaction form submit
function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('transactionId').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;
    
    const transaction = {
        id: id ? parseInt(id) : Date.now(),
        amount: amount,
        type: type,
        category: category,
        description: description,
        date: date
    };
    
    if (id) {
        // Update existing transaction
        const index = transactions.findIndex(t => t.id === parseInt(id));
        if (index !== -1) {
            transactions[index] = transaction;
            showNotification('Transaction updated successfully', 'success');
        }
    } else {
        // Add new transaction
        transactions.unshift(transaction);
        showNotification('Transaction added successfully', 'success');
    }
    
    saveTransactions();
    updateDashboard();
    closeModal();
}

// Open add transaction modal
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Add Transaction';
    document.getElementById('transactionForm').reset();
    document.getElementById('transactionId').value = '';
    setDefaultDate();
    updateCategoryOptions();
    document.getElementById('transactionModal').style.display = 'block';
}

// Open edit transaction modal
function openEditModal(id) {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        document.getElementById('modalTitle').textContent = 'Edit Transaction';
        document.getElementById('transactionId').value = transaction.id;
        document.getElementById('amount').value = transaction.amount;
        document.getElementById('type').value = transaction.type;
        document.getElementById('category').value = transaction.category;
        document.getElementById('description').value = transaction.description;
        document.getElementById('date').value = transaction.date;
        updateCategoryOptions();
        document.getElementById('transactionModal').style.display = 'block';
    }
}

// Close modal
function closeModal() {
    document.getElementById('transactionModal').style.display = 'none';
}

// Delete transaction
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        updateDashboard();
        showNotification('Transaction deleted successfully', 'success');
    }
}

// Update dashboard
function updateDashboard() {
    updateSummaryCards();
    displayRecentTransactions();
    updateCategoryChart();
}

// Update summary cards
function updateSummaryCards() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expenses;
    
    document.getElementById('totalBalance').textContent = formatCurrency(balance);
    document.getElementById('totalIncome').textContent = formatCurrency(income);
    document.getElementById('totalExpenses').textContent = formatCurrency(expenses);
}

// Display recent transactions
function displayRecentTransactions() {
    const container = document.getElementById('recentTransactionsList');
    const recentTransactions = transactions.slice(0, 5);
    
    if (recentTransactions.length === 0) {
        container.innerHTML = '<p class="no-data">No transactions yet</p>';
        return;
    }
    
    container.innerHTML = recentTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
                </div>
                <div class="transaction-meta">
                    ${transaction.description} • ${transaction.category} • ${formatDate(transaction.date)}
                </div>
            </div>
        </div>
    `).join('');
}

// Display all transactions
function displayTransactions() {
    const container = document.getElementById('transactionsList');
    let filteredTransactions = [...transactions];
    
    // Apply filters
    const filterType = document.getElementById('filterType').value;
    const filterCategory = document.getElementById('filterCategory').value;
    const filterMonth = document.getElementById('filterMonth').value;
    
    if (filterType) {
        filteredTransactions = filteredTransactions.filter(t => t.type === filterType);
    }
    
    if (filterCategory) {
        filteredTransactions = filteredTransactions.filter(t => t.category === filterCategory);
    }
    
    if (filterMonth) {
        filteredTransactions = filteredTransactions.filter(t => t.date.startsWith(filterMonth));
    }
    
    if (filteredTransactions.length === 0) {
        container.innerHTML = '<p class="no-data">No transactions found</p>';
        return;
    }
    
    container.innerHTML = filteredTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
                </div>
                <div class="transaction-meta">
                    ${transaction.description} • ${transaction.category} • ${formatDate(transaction.date)}
                </div>
            </div>
            <div class="transaction-actions">
                <button class="btn btn-edit" onclick="openEditModal(${transaction.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteTransaction(${transaction.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Filter transactions
function filterTransactions() {
    displayTransactions();
}

// Clear filters
function clearFilters() {
    document.getElementById('filterType').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterMonth').value = '';
    displayTransactions();
}

// Update category chart
function updateCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (charts.category) {
        charts.category.destroy();
    }
    
    // Calculate category totals for expenses
    const categoryTotals = {};
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });
    
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    if (labels.length === 0) {
        // Show empty state
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#7f8c8d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No expense data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }
    
    charts.category = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                    '#FF6384',
                    '#C9CBCF'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Update reports
function updateReports() {
    updateMonthlyChart();
    updateIncomeExpenseChart();
}

// Update monthly chart
function updateMonthlyChart() {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (charts.monthly) {
        charts.monthly.destroy();
    }
    
    // Get last 6 months
    const months = [];
    const incomeData = [];
    const expenseData = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = date.toISOString().slice(0, 7);
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        months.push(monthName);
        
        const monthIncome = transactions
            .filter(t => t.type === 'income' && t.date.startsWith(monthStr))
            .reduce((sum, t) => sum + t.amount, 0);
        
        const monthExpenses = transactions
            .filter(t => t.type === 'expense' && t.date.startsWith(monthStr))
            .reduce((sum, t) => sum + t.amount, 0);
        
        incomeData.push(monthIncome);
        expenseData.push(monthExpenses);
    }
    
    charts.monthly = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Income',
                data: incomeData,
                backgroundColor: '#27ae60'
            }, {
                label: 'Expenses',
                data: expenseData,
                backgroundColor: '#e74c3c'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

// Update income vs expense chart
function updateIncomeExpenseChart() {
    const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (charts.incomeExpense) {
        charts.incomeExpense.destroy();
    }
    
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    charts.incomeExpense = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                data: [totalIncome, totalExpenses],
                backgroundColor: ['#27ae60', '#e74c3c']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Export to CSV
function exportToCSV() {
    if (transactions.length === 0) {
        showNotification('No transactions to export', 'error');
        return;
    }
    
    // Create CSV content
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = transactions.map(t => [
        t.date,
        t.type,
        t.category,
        t.description,
        t.amount
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully', 'success');
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background-color: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 3000);
}